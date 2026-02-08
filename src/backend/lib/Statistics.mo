module {
  public type MonthlyReportStats = {
    total : Nat;
    monthly : [Nat];
  };

  public type StatusBreakdown = {
    total : Nat;
    lost : Nat;
    stolen : Nat;
    active : Nat;
  };

  public type Statistics = {
    totalPhones : Nat;
    lostPhones : Nat;
    stolenPhones : Nat;
    activePhones : Nat;
    statusBreakdown : StatusBreakdown;
    theftReportStats : MonthlyReportStats;
  };
};
