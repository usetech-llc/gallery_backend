import { Bytes, GenericAccountId, Struct } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';

const registry = new TypeRegistry();

function encodeScale(params: any): Uint8Array {
  const s = new Struct(registry, {
    account: GenericAccountId,
    strData: Bytes,
  }, params);

  return s.toU8a();
}

function decodeScale(data: Uint8Array): any {
  const s = new Struct(registry, {
    account: GenericAccountId,
    strData: Bytes,
  }, data as any);

  return JSON.parse(s.toString());
}

// Demo:
const encoded = encodeScale({
  account: '5CtySW8czRJAFznj5iGqA4PNWv74zzMFZwRsDgMxfonUo5RZ',
  strData: 'Hello!'
});

console.log(encoded.toString());

const decoded = decodeScale(encoded);

console.log(decoded.strData.toString());

console.log({
  account: GenericAccountId,
  strData: Bytes,
});
