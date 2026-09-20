using Aviqora.Domain.ValueObjects;
using Xunit;

namespace Aviqora.UnitTests.Domain;

public class PNRCodeTests
{
    [Fact]
    public void Generate_ShouldReturnSixCharacterAlphanumericString()
    {
        // Act
        var pnr = PNRCode.Generate();

        // Assert
        Assert.NotNull(pnr.Value);
        Assert.Equal(6, pnr.Value.Length);
        Assert.Matches("^[A-Z0-9]{6}$", pnr.Value);
    }

    [Theory]
    [InlineData("ABC123")]
    [InlineData("XYZ999")]
    public void Constructor_WithValidValue_ShouldInitialize(string validPnr)
    {
        // Act
        var pnr = new PNRCode(validPnr);

        // Assert
        Assert.Equal(validPnr, pnr.Value);
    }

    [Theory]
    [InlineData("TOO_LONG_PNR")]
    [InlineData("SHORT")]
    [InlineData("12345!")]
    [InlineData("")]
    public void Constructor_WithInvalidValue_ShouldThrowArgumentException(string invalidPnr)
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => new PNRCode(invalidPnr));
    }
}
