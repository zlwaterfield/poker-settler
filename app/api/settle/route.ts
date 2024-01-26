type Debt = {
  [key: string]: number;
};

type Transaction = {
  debtor: string;
  creditor: string;
  amount: number;
};

export async function POST(request: Request) {
  const debts: Debt = await request.json()
  const transactions: Transaction[] = settleDebts(debts);
  return Response.json(transactions)
}

function settleDebts(debts: Debt): Transaction[] {
  const sortedDebts = Object.entries(debts).sort((a, b) => a[1] - b[1]);
  let transactions: Transaction[] = [];

  let i = 0;
  let j = sortedDebts.length - 1;

  while (i < j) {
    const [debtor, debtAmount] = sortedDebts[i];
    const [creditor, creditAmount] = sortedDebts[j];

    const transactionAmount = Math.min(-debtAmount, creditAmount);
    transactions.push({ debtor, creditor, amount: transactionAmount });

    sortedDebts[i][1] += transactionAmount;
    sortedDebts[j][1] -= transactionAmount;

    if (sortedDebts[i][1] >= 0) {
      i++;
    }

    if (sortedDebts[j][1] <= 0) {
      j--;
    }
  }

  return transactions;
}


