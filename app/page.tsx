"use client";

import { useState } from 'react';

type Person = {
  id: number;
  name?: string;
  startValue?: number;
  endValue?: number;
};

type Transaction = {
  debtor: string;
  creditor: string;
  amount: number;
};

export default function Home() {
  const [people, setPeople] = useState<Person[]>([{ id: Date.now() }]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null); // State to hold validation error message
  
  const addPerson = () => {
    setPeople([...people, { id: Date.now() }]);
  };

  const removePerson = (id: number) => {
    setPeople(people.filter(person => person.id !== id));
  };

  const updatePerson = (id: number, field: keyof Person, value: string) => {
    const numericValue = field === 'name' ? value : value ? parseFloat(value) : '';
    setPeople(people.map(person => (person.id === id ? { ...person, [field]: numericValue } : person)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const totalStartValue = people.reduce((acc, { startValue }) => acc + (startValue || 0), 0);
    const totalEndValue = people.reduce((acc, { endValue }) => acc + (endValue || 0), 0);

    if (totalStartValue === 0 || totalEndValue === 0) {
      setError('The sum of all starting values and ending values must be greater than 0.');
      return;
    }
    if (people.length < 2) {
      setError('You must have at least two players.');
      return;
    }
    if (totalStartValue !== totalEndValue) {
      setError('The sum of all starting values must equal the sum of all ending values.');
      return;
    }

    const debts = people.reduce((acc, { name, startValue, endValue }) => {
      const netValue = (typeof endValue === 'number' ? endValue : 0) - (typeof startValue === 'number' ? startValue : 0);
      // @ts-ignore
      if (name) acc[name] = netValue;
      return acc;
    }, {});

    const response = await fetch('/api/settle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(debts),
    });

    const result = await response.json();
    setTransactions(result);
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="block sm:flex sm:justify-between sm:items-start">
            <div>
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Poker Settler</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">Add the players and their starting and ending values to get started.</p>
            </div>
            <button
              type="button"
              onClick={addPerson}
              className="mt-2 sm:mt-0 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Add player
            </button>
          </div>

          {people.map((person, index) => (
            <div className=" bg-gray-100 rounded-lg p-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-7 items-end" key={person.id}>
              <div className="sm:col-span-2">
                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                  First name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    className="block w-full rounded-md border-0 px-2.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={person.name}
                    onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                  Starting Value
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="starting-value"
                    id="starting-value"
                    className="block w-full rounded-md border-0 px-2.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={person.startValue}
                    onChange={(e) => updatePerson(person.id, 'startValue', e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Ending Value
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="ending-value"
                    name="ending-value"
                    className="block w-full rounded-md border-0 px-2.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={person.endValue}
                    onChange={(e) => updatePerson(person.id, 'endValue', e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:col-span-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removePerson(person.id)}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>


        {error && (
          <div className="text-red-500 bg-red-200 border-2 border-red-400 rounded-lg p-3 my-3 text-sm inline-block">
            {error}
          </div>
        )}

        <div className="mt-3 flex items-center justify-start gap-x-4">
          <button
            type="submit"

            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Submit
          </button>
        </div>
      </form>

      {transactions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <ul className="my-2">
            {transactions.map((transaction, index) => (
              <li key={index} className="mb-2 bg-gray-200 p-3 rounded-lg w-full max-w-md">
                <span className="font-semibold">{transaction.debtor}</span> pays <span className="font-semibold">{transaction.creditor}</span>: ${transaction.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
