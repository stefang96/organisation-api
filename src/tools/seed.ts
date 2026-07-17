import "reflect-metadata";
import dotenv from "dotenv";
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
  const newsItems = [
    {
      title: "Acme launches new product line",
      shortDescription: "A short teaser about the launch.",
      description: "Acme Inc announced a new product line today...",
      member: acmeAdmin,
    },
    {
      title: "Bob joins the Acme team",
      shortDescription: "Welcome Bob!",
      description: "We are happy to welcome Bob Brown to Acme.",
      member: acmeMember1,
    },
    {
      title: "Globex opens a new office",
      shortDescription: "Expansion news.",
      description: "Globex LLC is expanding to a new location.",
      member: globexAdmin,
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
    await newsRepo.save(n);
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
