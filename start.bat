@echo off

cd start

start "admin" cmd /k call admin.bat
start "customers" cmd /k call customers.bat
start "shipping" cmd /k call shipping.bat

exit