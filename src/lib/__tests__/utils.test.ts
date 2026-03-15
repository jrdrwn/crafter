import { cn, slugify } from "@/lib/utils";

describe("cn (classname merge)", () => {
  it("menggabungkan class sederhana", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("mengabaikan nilai falsy", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("merge class Tailwind yang konflik (tailwind-merge)", () => {
    // tailwind-merge harus memilih kelas terakhir saat konflik
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("slugify", () => {
  it("mengubah teks ke lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("mengganti spasi dengan tanda hubung", () => {
    expect(slugify("Unit Testing Jest")).toBe("unit-testing-jest");
  });

  it("mengganti & dengan 'and'", () => {
    expect(slugify("Salt & Pepper")).toBe("salt-and-pepper");
  });

  it("menghapus karakter non-alphanumeric selain tanda hubung", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("trim leading/trailing tanda hubung", () => {
    expect(slugify("  -Hello World-  ")).toBe("hello-world");
  });

  it("string kosong menghasilkan string kosong", () => {
    expect(slugify("")).toBe("");
  });
});
