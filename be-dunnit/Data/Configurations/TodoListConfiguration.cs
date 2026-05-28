using be_dunnit.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace be_dunnit.Data.Configurations;

public class TodoListConfiguration : IEntityTypeConfiguration<TodoList>
{
    public void Configure(EntityTypeBuilder<TodoList> builder)
    {
        builder.HasQueryFilter(l => l.DeletedAt == null);

        builder.HasOne(l => l.Creator)
            .WithMany()
            .HasForeignKey(l => l.CreatorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(l => new { l.CreatorUserId, l.SortOrder });
    }
}
