/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface Message {
  id: bigint;
  participantId: string;
  participantName: string;
  text: string;
  timestamp: bigint;
  isMalpractice: boolean;
}

export interface Participant {
  id: string;
  name: string;
}

export interface _SERVICE {
  registerParticipant: ActorMethod<[string], string>;
  sendMessage: ActorMethod<[string, string, string], bigint>;
  flagMalpractice: ActorMethod<[string, string, string], bigint>;
  getMyMessages: ActorMethod<[string], Message[]>;
  getAllMessages: ActorMethod<[string], [Message[]] | []>;
  getParticipants: ActorMethod<[string], [Participant[]] | []>;
}

export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
