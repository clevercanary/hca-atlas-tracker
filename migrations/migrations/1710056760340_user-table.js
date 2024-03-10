/* eslint-disable @typescript-eslint/explicit-function-return-type */

exports.up = (pgm) => {
  pgm.createSchema("hat", { ifNotExists: true });

  pgm.createTable(
    { name: "users", schema: "hat" },
    {
      disabled: { notNull: true, type: "boolean" },
      email: { notNull: true, type: "varchar(255)", unique: true },
      full_name: { notNull: true, type: "text" },
      id: { notNull: true, type: "serial" },
      last_login: {
        default: pgm.func("timestamp 'epoch'"),
        notNull: true,
        type: "timestamp",
      },
      role: { notNull: true, type: "varchar(50)" },
    }
  );

  pgm.addConstraint({ name: "users", schema: "hat" }, "pk_users_id", {
    primaryKey: "id",
  });
};

//SELECT * FROM  hat.users WHERE email='dave@clevercanary.com';
