using Spiccioli.Api.Dtos;
using Spiccioli.Api.Common;

namespace Spiccioli.Api.Services;

public interface IProfileService
{
    Task<Result<UserResponse>> GetAsync(Guid userId);
}