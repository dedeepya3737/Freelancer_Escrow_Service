import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDGTD5J73DOLU7LRBFZ3IIGTUQRLMPMKFCRLTGQU24PDGRLJIXFOFXD7",
  }
} as const

/**
 * Mapping escrow_id to EscrowAgreement
 */
export type EscrowBook = {tag: "Job", values: readonly [u64]};

/**
 * Status of the Escrow agreement
 */
export type EscrowStatus = {tag: "Active", values: void} | {tag: "Submitted", values: void} | {tag: "Released", values: void} | {tag: "Refunded", values: void};


/**
 * Structure to store Escrow information
 */
export interface EscrowAgreement {
  amount: i128;
  client: string;
  deadline: u64;
  freelancer: string;
  status: EscrowStatus;
}

export interface Client {
  /**
   * Construct and simulate a refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Called by the client to get a refund if the freelancer misses the deadline
   */
  refund: ({escrow_id}: {escrow_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Called by the freelancer to signal work completion
   */
  submit_work: ({escrow_id}: {escrow_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a view_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Views details of a specific escrow
   */
  view_escrow: ({escrow_id}: {escrow_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<EscrowAgreement>>

  /**
   * Construct and simulate a create_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initializes a new escrow agreement
   * Parameters:
   * - client: Address of the person paying
   * - freelancer: Address of the person working
   * - amount: Amount to lock (in stroops)
   * - duration: Seconds until the deadline
   */
  create_escrow: ({client, freelancer, amount, duration}: {client: string, freelancer: string, amount: i128, duration: u64}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a release_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Called by the client to approve work and release funds
   */
  release_payment: ({escrow_id}: {escrow_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_escrow_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_escrow_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAACRNYXBwaW5nIGVzY3Jvd19pZCB0byBFc2Nyb3dBZ3JlZW1lbnQAAAAAAAAACkVzY3Jvd0Jvb2sAAAAAAAEAAAABAAAAAAAAAANKb2IAAAAAAQAAAAY=",
        "AAAAAgAAAB5TdGF0dXMgb2YgdGhlIEVzY3JvdyBhZ3JlZW1lbnQAAAAAAAAAAAAMRXNjcm93U3RhdHVzAAAABAAAAAAAAAAAAAAABkFjdGl2ZQAAAAAAAAAAAAAAAAAJU3VibWl0dGVkAAAAAAAAAAAAAAAAAAAIUmVsZWFzZWQAAAAAAAAAAAAAAAhSZWZ1bmRlZA==",
        "AAAAAQAAACVTdHJ1Y3R1cmUgdG8gc3RvcmUgRXNjcm93IGluZm9ybWF0aW9uAAAAAAAAAAAAAA9Fc2Nyb3dBZ3JlZW1lbnQAAAAABQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAZjbGllbnQAAAAAABMAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAKZnJlZWxhbmNlcgAAAAAAEwAAAAAAAAAGc3RhdHVzAAAAAAfQAAAADEVzY3Jvd1N0YXR1cw==",
        "AAAAAAAAAEpDYWxsZWQgYnkgdGhlIGNsaWVudCB0byBnZXQgYSByZWZ1bmQgaWYgdGhlIGZyZWVsYW5jZXIgbWlzc2VzIHRoZSBkZWFkbGluZQAAAAAABnJlZnVuZAAAAAAAAQAAAAAAAAAJZXNjcm93X2lkAAAAAAAABgAAAAA=",
        "AAAAAAAAADJDYWxsZWQgYnkgdGhlIGZyZWVsYW5jZXIgdG8gc2lnbmFsIHdvcmsgY29tcGxldGlvbgAAAAAAC3N1Ym1pdF93b3JrAAAAAAEAAAAAAAAACWVzY3Jvd19pZAAAAAAAAAYAAAAA",
        "AAAAAAAAACJWaWV3cyBkZXRhaWxzIG9mIGEgc3BlY2lmaWMgZXNjcm93AAAAAAALdmlld19lc2Nyb3cAAAAAAQAAAAAAAAAJZXNjcm93X2lkAAAAAAAABgAAAAEAAAfQAAAAD0VzY3Jvd0FncmVlbWVudAA=",
        "AAAAAAAAAM5Jbml0aWFsaXplcyBhIG5ldyBlc2Nyb3cgYWdyZWVtZW50ClBhcmFtZXRlcnM6Ci0gY2xpZW50OiBBZGRyZXNzIG9mIHRoZSBwZXJzb24gcGF5aW5nCi0gZnJlZWxhbmNlcjogQWRkcmVzcyBvZiB0aGUgcGVyc29uIHdvcmtpbmcKLSBhbW91bnQ6IEFtb3VudCB0byBsb2NrIChpbiBzdHJvb3BzKQotIGR1cmF0aW9uOiBTZWNvbmRzIHVudGlsIHRoZSBkZWFkbGluZQAAAAAADWNyZWF0ZV9lc2Nyb3cAAAAAAAAEAAAAAAAAAAZjbGllbnQAAAAAABMAAAAAAAAACmZyZWVsYW5jZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAIZHVyYXRpb24AAAAGAAAAAQAAAAY=",
        "AAAAAAAAADZDYWxsZWQgYnkgdGhlIGNsaWVudCB0byBhcHByb3ZlIHdvcmsgYW5kIHJlbGVhc2UgZnVuZHMAAAAAAA9yZWxlYXNlX3BheW1lbnQAAAAAAQAAAAAAAAAJZXNjcm93X2lkAAAAAAAABgAAAAA=",
        "AAAAAAAAAAAAAAAQZ2V0X2VzY3Jvd19jb3VudAAAAAAAAAABAAAABg==" ]),
      options
    )
  }
  public readonly fromJSON = {
    refund: this.txFromJSON<null>,
        submit_work: this.txFromJSON<null>,
        view_escrow: this.txFromJSON<EscrowAgreement>,
        create_escrow: this.txFromJSON<u64>,
        release_payment: this.txFromJSON<null>,
        get_escrow_count: this.txFromJSON<u64>
  }
}