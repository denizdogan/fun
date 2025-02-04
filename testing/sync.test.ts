import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";

import * as S from "../sync.ts";
import * as O from "../option.ts";
import { pipe } from "../fn.ts";

const add = (n: number) => n + 1;

// deno-lint-ignore no-explicit-any
const assertEqualsSync = (a: S.Sync<any>, b: S.Sync<any>) =>
  assertEquals(a(), b());

Deno.test("Sync of", () => {
  assertEqualsSync(S.of(1), S.of(1));
});

Deno.test("Sync ap", () => {
  assertEquals(pipe(S.of(add), S.ap(S.of(1)))(), S.of(2)());
});

Deno.test("Sync map", () => {
  const map = S.map(add);
  assertEqualsSync(map(S.of(1)), S.of(2));
});

Deno.test("Sync join", () => {
  assertEqualsSync(S.join(S.of(S.of(1))), S.of(1));
});

Deno.test("Sync chain", () => {
  const chain = S.chain((n: number) => S.of(n + 1));
  assertEqualsSync(chain(S.of(1)), S.of(2));
});

Deno.test("Sync reduce", () => {
  const reduce = S.reduce((acc: number, cur: number) => acc + cur, 0);
  assertEquals(reduce(S.of(1)), 1);
});

Deno.test("Sync traverse", () => {
  const fold = O.match(() => -1, (n: S.Sync<number>) => n());
  const t0 = S.traverse(O.MonadOption);
  const t1 = t0((n: number) => n === 0 ? O.none : O.some(n));
  const t2 = fold(t1(S.of(0)));
  const t3 = fold(t1(S.of(1)));

  assertEquals(t2, -1);
  assertEquals(t3, 1);
});

Deno.test("Sync extend", () => {
  const extend = S.extend((ta: S.Sync<number>) => ta() + 1);
  assertEqualsSync(extend(S.of(1)), S.of(2));
});

// Deno.test("Sync Do, bind, bindTo", () => {
//   assertEqualsSync(
//     pipe(
//       S.Do(),
//       S.bind("one", () => S.of(1)),
//       S.bind("two", ({ one }) => S.of(one + one)),
//       S.map(({ one, two }) => one + two),
//     ),
//     S.of(3),
//   );
//   assertEqualsSync(
//     pipe(
//       S.of(1),
//       S.bindTo("one"),
//     ),
//     S.of({ one: 1 }),
//   );
// });
