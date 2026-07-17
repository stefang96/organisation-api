import "reflect-metadata";
import dotenv from "dotenv";
import fs from "fs";
import zlib from "zlib";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import * as bcrypt from "bcrypt";
import { Organisation } from "../entities/organisation.model";
import { Member, MembersRole } from "../entities/member.model";
import { News } from "../entities/news.model";
import { Payments } from "../entities/payments.model";

dotenv.config();

// Shared password for every seeded member, so you can log in with any of the
// accounts printed at the end.
const PASSWORD = "Password123";

const now = () => Math.floor(Date.now() / 1000);

const PUBLIC_FOLDER = process.env.PUBLIC_FOLDER || "public";
const API_BASE_URL =
  process.env.API_BASE_URL || `http://localhost:${process.env.SERVER_PORT}`;

// Standard CRC-32 (as required by the PNG spec). Implemented locally so this
// tool does not depend on zlib.crc32 (only present on newer Node versions).
function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Build a solid-colour PNG buffer, so seeded news items have a real cover
// image instead of a broken-image placeholder in the UI.
function solidPng(width: number, height: number, rgb: [number, number, number]) {
  const chunk = (type: string, data: Buffer) => {
    const typeBuf = Buffer.from(type, "ascii");
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB

  const rowLen = width * 3;
  const raw = Buffer.alloc((rowLen + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowLen + 1); // leading filter byte stays 0
    for (let x = 0; x < width; x++) {
      const p = rowStart + 1 + x * 3;
      raw[p] = rgb[0];
      raw[p + 1] = rgb[1];
      raw[p + 2] = rgb[2];
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Write a cover image for a news item and return its stored file name.
function writeCoverImage(newsId: number, rgb: [number, number, number]) {
  const dir = `${PUBLIC_FOLDER}/news_${newsId}`;
  fs.mkdirSync(dir, { recursive: true });
  const fileName = "cover.png";
  fs.writeFileSync(`${dir}/${fileName}`, solidPng(600, 400, rgb));
  return fileName;
}

// Entities are referenced as classes here (rather than the dist glob used by
// the app) so this script runs directly with ts-node.
const options: ConnectionOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [Organisation, Member, News, Payments],
  synchronize: true,
};

async function clearAll(connection: Connection) {
  // Delete in FK-safe order. organisation -> member is ON DELETE CASCADE, so
  // deleting organisations also removes their members, news and payments, but
  // we clear the leaf tables first to be explicit and safe on re-runs.
  await connection.createQueryBuilder().delete().from(News).execute();
  await connection.createQueryBuilder().delete().from(Payments).execute();
  await connection.createQueryBuilder().delete().from(Organisation).execute();
  await connection.createQueryBuilder().delete().from(Member).execute();
}

async function seed() {
  const connection = await createConnection(options);
  console.log("Connected to DB. Clearing existing data...");
  await clearAll(connection);

  const orgRepo = connection.getRepository(Organisation);
  const memberRepo = connection.getRepository(Member);
  const newsRepo = connection.getRepository(News);
  const paymentsRepo = connection.getRepository(Payments);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const makeMember = (
    org: Organisation,
    firstName: string,
    lastName: string,
    email: string,
    role: MembersRole
  ) => {
    const m = new Member();
    m.firstName = firstName;
    m.lastName = lastName;
    m.email = email;
    m.password = passwordHash;
    m.phone = "+3816000000";
    m.role = role;
    m.verified = true;
    m.active = true;
    m.createdAt = now();
    m.organisation = org;
    return m;
  };

  // --- Organisation 1: platform HQ, home of the super admin -----------------
  let hq = new Organisation();
  hq.name = "Platform HQ";
  hq.address = "1 Platform Way";
  hq.type = "Platform";
  hq.numberOfEmployees = 3;
  hq.price = 0;
  hq.active = true;
  hq.createdAt = now();
  hq = await orgRepo.save(hq);

  const superAdmin = await memberRepo.save(
    makeMember(hq, "Super", "Admin", "superadmin@example.com", MembersRole.SUPER_ADMIN)
  );
  hq.contactPerson = superAdmin;
  await orgRepo.save(hq);

  // --- Organisation 2: Acme, with an admin contact and members -------------
  let acme = new Organisation();
  acme.name = "Acme Inc";
  acme.address = "42 Industrial Rd";
  acme.type = "Manufacturing";
  acme.numberOfEmployees = 120;
  acme.price = 250;
  acme.active = true;
  acme.createdAt = now();
  acme = await orgRepo.save(acme);

  const acmeAdmin = await memberRepo.save(
    makeMember(acme, "Alice", "Adams", "admin@acme.com", MembersRole.ADMIN)
  );
  const acmeMember1 = await memberRepo.save(
    makeMember(acme, "Bob", "Brown", "bob@acme.com", MembersRole.MEMBER)
  );
  const acmeMember2 = await memberRepo.save(
    makeMember(acme, "Carol", "Clark", "carol@acme.com", MembersRole.MEMBER)
  );
  acme.contactPerson = acmeAdmin;
  await orgRepo.save(acme);

  // --- Organisation 3: Globex ----------------------------------------------
  let globex = new Organisation();
  globex.name = "Globex LLC";
  globex.address = "9 Enterprise Ave";
  globex.type = "Consulting";
  globex.numberOfEmployees = 15;
  globex.price = 99;
  globex.active = true;
  globex.createdAt = now();
  globex = await orgRepo.save(globex);

  const globexAdmin = await memberRepo.save(
    makeMember(globex, "Dan", "Davis", "admin@globex.com", MembersRole.ADMIN)
  );
  globex.contactPerson = globexAdmin;
  await orgRepo.save(globex);

  // --- News ----------------------------------------------------------------
  const newsItems: Array<{
    title: string;
    shortDescription: string;
    description: string;
    member: Member;
    color: [number, number, number];
  }> = [
    {
      title: "Acme launches new product line",
      shortDescription: "A short teaser about the launch.",
      description: "Acme Inc announced a new product line today...",
      member: acmeAdmin,
      color: [37, 99, 235], // blue
    },
    {
      title: "Bob joins the Acme team",
      shortDescription: "Welcome Bob!",
      description: "We are happy to welcome Bob Brown to Acme.",
      member: acmeMember1,
      color: [22, 163, 74], // green
    },
    {
      title: "Globex opens a new office",
      shortDescription: "Expansion news.",
      description: "Globex LLC is expanding to a new location.",
      member: globexAdmin,
      color: [217, 70, 70], // red
    },
  ];
  for (const item of newsItems) {
    const n = new News();
    n.title = item.title;
    n.shortDescription = item.shortDescription;
    n.description = item.description;
    n.member = item.member;
    n.active = true;
    n.createdAt = now();
    const saved = await newsRepo.save(n);

    const fileName = writeCoverImage(saved.id, item.color);
    saved.fileName = fileName;
    saved.filePath = `${API_BASE_URL}/static/news_${saved.id}/${fileName}`;
    await newsRepo.save(saved);
  }

  // --- Payments ------------------------------------------------------------
  const p = new Payments();
  p.price = 250;
  p.fromDate = now();
  p.toDate = now() + 365 * 24 * 60 * 60; // ~1 year from now
  p.member = acmeAdmin;
  p.active = true;
  p.createdAt = now();
  await paymentsRepo.save(p);

  console.log("\nSeed complete. Accounts (password for all: %s):", PASSWORD);
  console.log("  super_admin : superadmin@example.com");
  console.log("  admin       : admin@acme.com, admin@globex.com");
  console.log("  member      : bob@acme.com, carol@acme.com");

  await connection.close();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
