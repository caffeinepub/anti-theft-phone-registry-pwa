module {
  public type NotificationType = {
    #success; // Phone registered, ownership transferred, etc.
    #info; // General informational notifications
    #warning; // Lost or stolen phone reports
  };

  public type Notification = {
    id : Nat;
    user : Principal;
    title : Text;
    message : Text;
    timestamp : Int;
    notifType : NotificationType;
    relatedIMEI : ?Text;
    isRead : Bool;
  };
};
