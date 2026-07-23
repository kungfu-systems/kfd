cmake_minimum_required(VERSION 3.16)
project(kfd_agent_hub_cpp_starter LANGUAGES CXX)
add_executable(kfd-agent-hub-cpp-starter adapter.cpp)
target_compile_features(kfd-agent-hub-cpp-starter PRIVATE cxx_std_17)
