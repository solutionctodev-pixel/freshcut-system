const { PrismaClient } = require("./generated/prisma");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email =
    "mitarbeiter.oberhausen@freshcut.de";

  const password =
    "Mitarbeiter123!";

  const passwordHash =
    await bcrypt.hash(password, 12);

  const user =
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        passwordHash,
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

  console.log("");
  console.log("================================");
  console.log("MITARBEITER AKTUALISIERT");
  console.log("================================");
  console.log("E-Mail:", user.email);
  console.log("Name:", user.firstName, user.lastName);
  console.log("Rolle:", user.role);
  console.log("Passwort:", password);
  console.log("================================");
}

main()
  .catch((error) => {
    console.error("FEHLER:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });