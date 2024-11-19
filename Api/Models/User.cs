namespace Api.Models
{
    public record User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string World { get; set; }
    }
}
