using Aviqora.Domain.ValueObjects;
using Xunit;

namespace Aviqora.UnitTests.Domain;

public class MoneyTests
{
    [Fact]
    public void Constructor_WithNegativeAmount_ShouldThrowArgumentException()
    {
        Assert.Throws<ArgumentException>(() => new Money(-10m, "TRY"));
    }

    [Fact]
    public void Add_WithSameCurrency_ShouldReturnSum()
    {
        var m1 = new Money(100m, "TRY");
        var m2 = new Money(50m, "TRY");

        var result = m1.Add(m2);

        Assert.Equal(150m, result.Amount);
        Assert.Equal("TRY", result.Currency);
    }

    [Fact]
    public void Add_WithDifferentCurrency_ShouldThrowInvalidOperationException()
    {
        var m1 = new Money(100m, "TRY");
        var m2 = new Money(50m, "USD");

        Assert.Throws<InvalidOperationException>(() => m1.Add(m2));
    }
}
