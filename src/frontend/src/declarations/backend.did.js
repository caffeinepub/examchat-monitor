/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const Message = IDL.Record({
  id: IDL.Nat,
  participantId: IDL.Text,
  participantName: IDL.Text,
  text: IDL.Text,
  timestamp: IDL.Int,
  isMalpractice: IDL.Bool,
});

const Participant = IDL.Record({
  id: IDL.Text,
  name: IDL.Text,
});

export const idlService = IDL.Service({
  registerParticipant: IDL.Func([IDL.Text], [IDL.Text], []),
  sendMessage: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
  flagMalpractice: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
  getMyMessages: IDL.Func([IDL.Text], [IDL.Vec(Message)], ['query']),
  getAllMessages: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(Message))], ['query']),
  getParticipants: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(Participant))], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Message = IDL.Record({
    id: IDL.Nat,
    participantId: IDL.Text,
    participantName: IDL.Text,
    text: IDL.Text,
    timestamp: IDL.Int,
    isMalpractice: IDL.Bool,
  });
  const Participant = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
  });
  return IDL.Service({
    registerParticipant: IDL.Func([IDL.Text], [IDL.Text], []),
    sendMessage: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    flagMalpractice: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    getMyMessages: IDL.Func([IDL.Text], [IDL.Vec(Message)], ['query']),
    getAllMessages: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(Message))], ['query']),
    getParticipants: IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(Participant))], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
