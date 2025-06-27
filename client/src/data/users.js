const users = [
  {
    mobile: "9028833979",
    name: "Vandan Dalvi",
    age: 21,
    aadhar: "1234-5678-9012",
    bankAccount: {
      number: "XXXX-1234",
      hasPastClaim: false
    },
    insurancePolicy: {
      number: "POL123456",
      type: "Health",
      coverage: 10000000,
      claimedAmount: 200000
    }
  },
  {
    mobile: "9123456780",
    name: "Shravani Rangnekar",
    age: 21,
    aadhar: "5678-1234-9012",
    bankAccount: {
      number: "XXXX-5678",
      hasPastClaim: true
    },
    insurancePolicy: {
      number: "POL987654",
      type: "Life",
      coverage: 2000000,
      claimedAmount: 1000000
    }
  }
];

export default users;
