using AutoMapper;
using SoftBridge.Domain.Models.User;
using SoftBridge.Shared.Dto_s.Auth.Sign_In_Up;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Services.AutoMapper.AuthMapping
{
    public class AuthProfile : Profile
    {
        public AuthProfile()
        {
            CreateMap<RegisterDto, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email.ToUpper()))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
}
