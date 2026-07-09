namespace Nomos.Application.Common;

/// <summary>Thrown when a request collides with existing state (e.g. duplicate username). Maps to HTTP 409.</summary>
public class ConflictException(string message) : Exception(message);
