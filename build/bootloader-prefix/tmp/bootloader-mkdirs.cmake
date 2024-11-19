# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "D:/Espressif/frameworks/esp-idf-v5.3.1/components/bootloader/subproject"
  "E:/ESPIDF/HealthST/build/bootloader"
  "E:/ESPIDF/HealthST/build/bootloader-prefix"
  "E:/ESPIDF/HealthST/build/bootloader-prefix/tmp"
  "E:/ESPIDF/HealthST/build/bootloader-prefix/src/bootloader-stamp"
  "E:/ESPIDF/HealthST/build/bootloader-prefix/src"
  "E:/ESPIDF/HealthST/build/bootloader-prefix/src/bootloader-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "E:/ESPIDF/HealthST/build/bootloader-prefix/src/bootloader-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "E:/ESPIDF/HealthST/build/bootloader-prefix/src/bootloader-stamp${cfgdir}") # cfgdir has leading slash
endif()
