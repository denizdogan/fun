import type { Alt } from "./alt.ts";
import type { Bifunctor } from "./bifunctor.ts";
import type { Extend } from "./extend.ts";
import type { Foldable } from "./foldable.ts";
import type { Kind, Out } from "./kind.ts";
import type { Monad } from "./monad.ts";
import type { Sync } from "./sync.ts";
import type { Either } from "./either.ts";

import * as E from "./either.ts";
import * as I from "./sync.ts";
import {
  createApplySemigroup,
  createSequenceStruct,
  createSequenceTuple,
} from "./apply.ts";
import { flow, identity, of as constant, pipe } from "./fn.ts";

export type SyncEither<L, R> = Sync<Either<L, R>>;

export interface URI extends Kind {
  readonly kind: SyncEither<Out<this, 1>, Out<this, 0>>;
}

export function left<A = never, B = never>(left: B): SyncEither<B, A> {
  return I.of(E.left(left));
}

export function right<A = never, B = never>(right: A): SyncEither<B, A> {
  return I.of(E.right(right));
}

export function tryCatch<A = never, B = never>(
  fa: () => A,
  onError: (error: unknown) => B,
): SyncEither<B, A> {
  try {
    return right(fa());
  } catch (e) {
    return left(onError(e));
  }
}

export function fromEither<A = never, B = never>(
  ta: E.Either<B, A>,
): SyncEither<B, A> {
  return constant(ta);
}

export function fromSync<A = never, B = never>(ta: Sync<A>): SyncEither<B, A> {
  return flow(ta, E.right);
}

export function of<A = never, B = never>(a: A): SyncEither<B, A> {
  return right(a);
}

export function throwError<A = never, B = never>(b: B): SyncEither<B, A> {
  return left(b);
}

export function ap<A, I, B>(
  tfai: SyncEither<B, (a: A) => I>,
): (ta: SyncEither<B, A>) => SyncEither<B, I> {
  return I.ap(pipe(tfai, I.map(E.ap)));
}

export function map<A, I>(
  fai: (a: A) => I,
): <B>(ta: SyncEither<B, A>) => SyncEither<B, I> {
  return I.map(E.map(fai));
}

export function chain<A, I, B>(
  fati: (a: A) => SyncEither<B, I>,
): (ta: SyncEither<B, A>) => SyncEither<B, I> {
  return (ta) => flow(ta, E.fold(E.left, (a) => fati(a)()));
}

export function join<A, B>(
  ta: SyncEither<B, SyncEither<B, A>>,
): SyncEither<B, A> {
  return pipe(ta, chain(identity));
}

export function chainLeft<A, B, J>(
  fbtj: (b: B) => SyncEither<J, A>,
): (ta: SyncEither<B, A>) => SyncEither<J, A> {
  return I.chain((e: E.Either<B, A>) => E.isLeft(e) ? fbtj(e.left) : I.of(e));
}

export function bimap<A, B, I, J>(
  fbj: (b: B) => J,
  fai: (a: A) => I,
): (ta: SyncEither<B, A>) => SyncEither<J, I> {
  return I.map(E.bimap(fbj, fai));
}

export function mapLeft<B, J>(
  fbj: (b: B) => J,
): <A>(ta: SyncEither<B, A>) => SyncEither<J, A> {
  return I.map(E.mapLeft(fbj));
}

export function alt<A = never, B = never>(
  tb: SyncEither<B, A>,
): (ta: SyncEither<B, A>) => SyncEither<B, A> {
  return (ta) => flow(ta, E.fold(tb, E.right));
}

export function extend<A, I, B>(
  ftai: (ta: SyncEither<B, A>) => I,
): (ta: SyncEither<B, A>) => SyncEither<B, I> {
  return flow(ftai, right);
}

export function reduce<A, O>(
  foao: (o: O, a: A) => O,
  o: O,
): <B>(ta: SyncEither<B, A>) => O {
  return (ta) => pipe(ta(), E.fold(() => o, (a) => foao(o, a)));
}

export const BifunctorSyncEither: Bifunctor<URI> = { bimap, mapLeft };

export const MonadSyncEither: Monad<URI> = {
  of,
  ap,
  map,
  join,
  chain,
};

export const AltSyncEither: Alt<URI> = { alt, map };

export const ExtendsSyncEither: Extend<URI> = { map, extend };

export const FoldableSyncEither: Foldable<URI> = { reduce };

export const getApplySemigroup = createApplySemigroup(MonadSyncEither);

export const sequenceTuple = createSequenceTuple(MonadSyncEither);

export const sequenceStruct = createSequenceStruct(MonadSyncEither);