# Security Decisions and Measures

## Safety Checklist
* Automated unit tests were written to ensure that contract logic behaves expectedly.
* Recursive calls were avoided to prevent re-entrancy attacks.
* State variables and functions visibility was optimized so that malicious access is restricted.

## SWC-101 (Integer Overflow and Underflow)
* Variable types and max-length were carefully chosen
* A library, SafeMath.sol was used to handle integer overflow and underflow exceptions and errors.

## SWC-102 (Outdated Compiler Version)
* Using an up-to-date compiler (0.8.4)

## SWC-103 (Floating pragma)
* Specific compiler pragma 0.8.4 used in contracts to avoid accidental bug inclusion through outdated compiler versions.

## SWC-107 (Re-entracy Attacks)
* Deposit function use a reentrancy lock

## SWC-131 (Presence of unused variables)
* Code has been cleaned and there is no unused variables