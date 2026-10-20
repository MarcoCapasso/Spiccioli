namespace Spiccioli.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string Email { get; set; } = string.Empty;

    //mostrare il setup iniziale al primo accesso
    public bool HasCompletedOnboarding { get; set; }
}