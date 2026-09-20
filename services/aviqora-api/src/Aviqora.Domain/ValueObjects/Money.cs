namespace Aviqora.Domain.ValueObjects;

public readonly record struct Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "TRY")
    {
        if (amount < 0)
        {
            throw new ArgumentException("Amount cannot be negative.", nameof(amount));
        }

        if (string.IsNullOrWhiteSpace(currency))
        {
            throw new ArgumentException("Currency cannot be empty.", nameof(currency));
        }

        Amount = decimal.Round(amount, 2);
        Currency = currency.ToUpperInvariant();
    }

    public static Money Zero(string currency = "TRY") => new(0m, currency);

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
        {
            throw new InvalidOperationException($"Cannot add money of different currencies: {Currency} and {other.Currency}");
        }

        return new Money(Amount + other.Amount, Currency);
    }

    public override string ToString() => $"{Amount:F2} {Currency}";
}
