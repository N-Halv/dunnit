using Dunnit.Api.Data;
using Dunnit.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Dunnit.Api.Services;

public interface IUserService
{
    Task<User> GetOrCreateByEmailAsync(
        string email,
        CancellationToken cancellationToken);
}

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User> GetOrCreateByEmailAsync(
        string email,
        CancellationToken cancellationToken)
    {
        // Note: This could result in a race condition where we attempt to create
        // two instances of the same user email if this endpoint is hit simultaneously.
        // In the worst case, one request would fail with a 500 error due to the
        // unique email constraint, and the user would need to retry. We're accepting
        // this risk as it would be very rare.
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user is not null)
        {
            return user;
        }

        user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);
        return user;
    }
}
