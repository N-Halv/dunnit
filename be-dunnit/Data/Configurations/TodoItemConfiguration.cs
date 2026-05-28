using be_dunnit.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace be_dunnit.Data.Configurations;

public class TodoItemConfiguration : IEntityTypeConfiguration<TodoItem>
{
    public void Configure(EntityTypeBuilder<TodoItem> builder)
    {
        builder.HasQueryFilter(i => i.DeletedAt == null && i.List.DeletedAt == null);

        builder.HasOne(i => i.List)
            .WithMany()
            .HasForeignKey(i => i.ListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => new { i.ListId, i.SortOrder });
    }
}
