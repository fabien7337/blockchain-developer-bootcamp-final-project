# Design Pattern Decisions

## Access Control Design Patterns
* `Ownable` design pattern used in two functions: `pause()` and `unpause()`. These functions do not need to be used by anyone else apart from the contract creator, i.e. the party that is responsible for managing the Index.

## Inheritance and Interfaces
* `SimpleIndex` contract inherits the OpenZeppelin `Ownable` contract to enable ownership for one managing user/party.
* `SimpleIndex` contract inherits the OpenZeppelin `Pausable` contract to implement an emergency stop mechanism.
* `SimpleIndex` contract inherits the OpenZeppelin `ReentrancyGuard` contract to make sure there are no nested (reentrant) calls to them.
