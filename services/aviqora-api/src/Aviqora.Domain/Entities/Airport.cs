namespace Aviqora.Domain.Entities;

public class Airport
{
    public Guid Id { get; private set; }
    public string Code { get; private set; } = null!; // e.g., "IST", "SAW", "BER"
    public string Name { get; private set; } = null!; // e.g., "Istanbul Airport"
    public string City { get; private set; } = null!; // e.g., "Istanbul"
    public string Country { get; private set; } = null!; // e.g., "Turkey"

    // Parameterless constructor for EF Core
    private Airport() { }

    public Airport(string code, string name, string city, string country)
    {
        if (string.IsNullOrWhiteSpace(code) || code.Length != 3)
        {
            throw new ArgumentException("Airport code must be 3 letters (IATA format).", nameof(code));
        }

        Id = Guid.NewGuid();
        Code = code.ToUpperInvariant();
        Name = name;
        City = city;
        Country = country;
    }
}
