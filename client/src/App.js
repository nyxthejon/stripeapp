import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';
import { Button } from './components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('http://localhost:4000/balance');
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();
      setBalance(data);
      setError(null);
    } catch (err) {
      setError('Error fetching balance');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleDeposit = async (amount) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount, currency = 'eur') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="space-y-4 w-96">
        {/* Balance Card */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <div className="flex justify-between items-center">
              <CardTitle>Current Balance</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchBalance}
                disabled={refreshing}
                className="h-8 w-8"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {balance ? (
              <div className="space-y-3">
                {balance.available?.map((bal) => (
                  <div key={bal.currency} className="flex justify-between items-center">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium text-green-600">
                      {formatAmount(bal.amount, bal.currency)}
                    </span>
                  </div>
                ))}
                {balance.pending?.map((bal) => (
                  <div key={bal.currency} className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600">
                      {formatAmount(bal.amount, bal.currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deposit Card */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-center">Deposit Funds</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-4">
              {[20, 40, 100].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handleDeposit(amount)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Deposit ${formatAmount(amount * 100)}`
                  )}
                </Button>
              ))}
            </div>
            {error && (
              <div className="text-red-500 mt-4 text-center">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="px-0 pb-0 text-sm text-gray-500 text-center">
            Test Mode: Use card 4242 4242 4242 4242
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default App;