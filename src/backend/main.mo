import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";

actor {
  type Message = {
    id: Nat;
    participantId: Text;
    participantName: Text;
    text: Text;
    timestamp: Int;
    isMalpractice: Bool;
  };

  type Participant = {
    id: Text;
    name: Text;
  };

  stable var messages: [Message] = [];
  stable var participants: [Participant] = [];
  stable var nextId: Nat = 0;
  stable var nextPid: Nat = 0;

  let HOST_PASSWORD = "TMMVVCE";

  public func registerParticipant(name: Text) : async Text {
    let pid = "p" # Nat.toText(nextPid);
    nextPid += 1;
    participants := Array.append(participants, [{ id = pid; name = name }]);
    pid
  };

  public func sendMessage(participantId: Text, participantName: Text, text: Text) : async Nat {
    let msg: Message = {
      id = nextId;
      participantId = participantId;
      participantName = participantName;
      text = text;
      timestamp = Time.now();
      isMalpractice = false;
    };
    nextId += 1;
    messages := Array.append(messages, [msg]);
    msg.id
  };

  public func flagMalpractice(participantId: Text, participantName: Text, malpracticeType: Text) : async Nat {
    let text = "[MALPRACTICE DETECTED: " # malpracticeType # "]";
    let msg: Message = {
      id = nextId;
      participantId = participantId;
      participantName = participantName;
      text = text;
      timestamp = Time.now();
      isMalpractice = true;
    };
    nextId += 1;
    messages := Array.append(messages, [msg]);
    msg.id
  };

  public query func getMyMessages(participantId: Text) : async [Message] {
    Array.filter(messages, func(m: Message) : Bool { m.participantId == participantId })
  };

  public query func getAllMessages(password: Text) : async ?[Message] {
    if (password == HOST_PASSWORD) {
      ?messages
    } else {
      null
    }
  };

  public query func getParticipants(password: Text) : async ?[Participant] {
    if (password == HOST_PASSWORD) {
      ?participants
    } else {
      null
    }
  };
};
