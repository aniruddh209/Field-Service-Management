namespace FieldServiceManagement.API.DTOs.CustomerAddresses;

public class CreateCustomerAddressDto
{
    public string AddressTitle { get; set; } = string.Empty;

    public string AddressLine { get; set; } = string.Empty;

    public string Area { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string Pincode { get; set; } = string.Empty;

    public string? Landmark { get; set; }
}