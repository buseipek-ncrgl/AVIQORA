namespace Aviqora.Domain.Entities;

public class Passenger
{
    public Guid Id { get; private set; }
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string IdentityNumber { get; private set; } = null!; // TCKN / Passport Number
    public string Email { get; private set; } = null!;
    public string PhoneNumber { get; private set; } = null!;

    private Passenger() { }

    public Passenger(string firstName, string lastName, string identityNumber, string email, string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name cannot be empty.", nameof(firstName));

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name cannot be empty.", nameof(lastName));

        if (string.IsNullOrWhiteSpace(identityNumber))
            throw new ArgumentException("Identity number cannot be empty.", nameof(identityNumber));

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            throw new ArgumentException("Valid email address is required.", nameof(email));

        Id = Guid.NewGuid();
        FirstName = firstName;
        LastName = lastName;
        IdentityNumber = identityNumber;
        Email = email;
        PhoneNumber = phoneNumber;
    }
}
