import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Iter "mo:core/Iter";

module {
  public type InviteLinksSystemState = {
    var rsvps : Map.Map<Text, RSVP>;
    var inviteCodes : Map.Map<Text, InviteCode>;
  };

  public func initState() : InviteLinksSystemState {
    {
      var rsvps = Map.empty<Text, RSVP>();
      var inviteCodes = Map.empty<Text, InviteCode>();
    };
  };

  public type RSVP = {
    name : Text;
    attending : Bool;
    timestamp : Time.Time;
    inviteCode : Text;
  };

  public type InviteCode = {
    code : Text;
    created : Time.Time;
    used : Bool;
  };

  func blobToUUID(blob : Blob) : Text {
    let bytes = blob.toArray();
    func hex(n : Nat8) : Text {
      let digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
      Text.fromChar(digits[(n / 16).toNat()]) # Text.fromChar(digits[(n % 16).toNat()]);
    };
    var uuid = "";
    for (i in bytes.keys()) {
      if (i == 4 or i == 6 or i == 8 or i == 10) { uuid #= "-" };
      if (i < 16) { uuid #= hex(bytes[i]) };
    };
    uuid;
  };

  public func generateUUID(blob : Blob) : Text {
    blobToUUID(blob);
  };

  public func generateInviteCode(state : InviteLinksSystemState, code : Text) {
    let invite : InviteCode = {
      code;
      created = Time.now();
      used = false;
    };
    state.inviteCodes.add(code, invite);
  };

  public func submitRSVP(state : InviteLinksSystemState, name : Text, attending : Bool, inviteCode : Text) {
    switch (state.inviteCodes.get(inviteCode)) {
      case (null) {
        Runtime.trap("Invalid invite code");
      };
      case (?invite) {
        if (invite.used) {
          Runtime.trap("Invite code already used");
        };
        let rsvp : RSVP = {
          name;
          attending;
          timestamp = Time.now();
          inviteCode;
        };
        let updatedInvite : InviteCode = {
          invite with used = true
        };
        state.rsvps.add(name, rsvp);
        state.inviteCodes.add(inviteCode, updatedInvite);
      };
    };
  };

  public func getAllRSVPs(state : InviteLinksSystemState) : [RSVP] {
    state.rsvps.values().toArray();
  };

  public func getInviteCodes(state : InviteLinksSystemState) : [InviteCode] {
    state.inviteCodes.values().toArray();
  };
};
