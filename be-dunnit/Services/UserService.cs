using be_dunnit.Data;
using be_dunnit.Models;
using Microsoft.EntityFrameworkCore;

namespace be_dunnit.Services;

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
