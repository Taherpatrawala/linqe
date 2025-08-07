import { Migration } from "@mikro-orm/migrations";

export class Migration20250807141252 extends Migration {
  override async up(): Promise<void> {
    // Create user table if it doesn't exist
    this.addSql(
      `create table if not exists "user" ("id" serial primary key, "email" varchar(255) not null, "name" varchar(255) not null, "password" varchar(255) not null, "bio" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`
    );

    // Add unique constraint only if it doesn't exist
    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'user_email_unique') then
        alter table "user" add constraint "user_email_unique" unique ("email");
      end if;
    end $$;`);

    // Create post table if it doesn't exist
    this.addSql(
      `create table if not exists "post" ("id" serial primary key, "content" text not null, "author_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`
    );

    // Add index only if it doesn't exist
    this.addSql(`do $$ begin
      if not exists (select 1 from pg_indexes where indexname = 'post_author_id_index') then
        create index "post_author_id_index" on "post" ("author_id");
      end if;
    end $$;`);

    // Create follow table if it doesn't exist
    this.addSql(
      `create table if not exists "follow" ("id" serial primary key, "follower_id" int not null, "following_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`
    );

    // Add unique constraint only if it doesn't exist
    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'follow_follower_id_following_id_unique') then
        alter table "follow" add constraint "follow_follower_id_following_id_unique" unique ("follower_id", "following_id");
      end if;
    end $$;`);

    // Add foreign key constraints only if they don't exist
    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'post_author_id_foreign') then
        alter table "post" add constraint "post_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;
      end if;
    end $$;`);

    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'follow_follower_id_foreign') then
        alter table "follow" add constraint "follow_follower_id_foreign" foreign key ("follower_id") references "user" ("id") on update cascade;
      end if;
    end $$;`);

    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'follow_following_id_foreign') then
        alter table "follow" add constraint "follow_following_id_foreign" foreign key ("following_id") references "user" ("id") on update cascade;
      end if;
    end $$;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "follow" cascade;`);
    this.addSql(`drop table if exists "post" cascade;`);
    this.addSql(`drop table if exists "user" cascade;`);
  }
}
