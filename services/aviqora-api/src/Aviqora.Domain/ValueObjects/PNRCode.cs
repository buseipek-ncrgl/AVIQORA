using System.Text.RegularExpressions;

namespace Aviqora.Domain.ValueObjects;

public readonly record struct PNRCode
{
    private static readonly Regex PnrRegex = new("^[A-Z0-9]{6}$", RegexOptions.Compiled);
    private static readonly Random RandomGenerator = new();
    private const string Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public string Value { get; }

    public PNRCode(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !PnrRegex.IsMatch(value.ToUpperInvariant()))
        {
            throw new ArgumentException("PNR code must be exactly 6 alphanumeric characters.", nameof(value));
        }

        Value = value.ToUpperInvariant();
    }

    public static PNRCode Generate()
    {
        char[] stringChars = new char[6];
        for (int i = 0; i < 6; i++)
        {
            stringChars[i] = Chars[RandomGenerator.Next(Chars.Length)];
        }

        return new PNRCode(new string(stringChars));
    }

    public override string ToString() => Value;
}
