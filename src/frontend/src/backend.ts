/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE, type Message, type Participant } from "./declarations/backend.did";

export type { Message, Participant };

export class ExternalBlob {
  _blob?: Uint8Array<ArrayBuffer> | null;
  directURL: string;
  onProgress?: (percentage: number) => void = undefined;
  private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
    if (blob) { this._blob = blob; }
    this.directURL = directURL;
  }
  static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
  static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
    const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
    return new ExternalBlob(url, blob);
  }
  public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    if (this._blob) return this._blob;
    const response = await fetch(this.directURL);
    const blob = await response.blob();
    this._blob = new Uint8Array(await blob.arrayBuffer());
    return this._blob;
  }
  public getDirectURL(): string { return this.directURL; }
  public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.onProgress = onProgress;
    return this;
  }
}

export interface backendInterface {
  registerParticipant(name: string): Promise<string>;
  sendMessage(participantId: string, participantName: string, text: string): Promise<bigint>;
  flagMalpractice(participantId: string, participantName: string, malpracticeType: string): Promise<bigint>;
  getMyMessages(participantId: string): Promise<Message[]>;
  getAllMessages(password: string): Promise<[Message[]] | []>;
  getParticipants(password: string): Promise<[Participant[]] | []>;
  _initializeAccessControlWithSecret(token: string): Promise<void>;
}

export class Backend implements backendInterface {
  constructor(
    private actor: ActorSubclass<_SERVICE>,
    private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    private processError?: (error: unknown) => never
  ) {}

  async registerParticipant(name: string): Promise<string> {
    try { return await this.actor.registerParticipant(name); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }

  async sendMessage(participantId: string, participantName: string, text: string): Promise<bigint> {
    try { return await this.actor.sendMessage(participantId, participantName, text); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }

  async flagMalpractice(participantId: string, participantName: string, malpracticeType: string): Promise<bigint> {
    try { return await this.actor.flagMalpractice(participantId, participantName, malpracticeType); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }

  async getMyMessages(participantId: string): Promise<Message[]> {
    try { return await this.actor.getMyMessages(participantId); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }

  async getAllMessages(password: string): Promise<[Message[]] | []> {
    try { return await this.actor.getAllMessages(password); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }

  async getParticipants(password: string): Promise<[Participant[]] | []> {
    try { return await this.actor.getParticipants(password); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }

  async _initializeAccessControlWithSecret(_token: string): Promise<void> {
    // No-op: authorization component not used
  }
}

export interface CreateActorOptions {
  agent?: Agent;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
  processError?: (error: unknown) => never;
}

export function createActor(
  canisterId: string,
  _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
  options: CreateActorOptions = {}
): Backend {
  const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions.");
  }
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
