// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/// @title Last Hero
/// @notice A LitVM-native last-ticket-wins game paid in zkLTC.
contract LastHero is ReentrancyGuard {
    uint256 public constant TICKET_PRICE = 0.01 ether;
    uint256 public constant INITIAL_DURATION = 30 minutes;
    uint256 public constant EXTENSION = 5 minutes;
    uint256 public constant MAX_ENDS_AT_FROM_NOW = 1 hours;
    uint256 public constant PRIZE_BPS = 9_000;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    struct RoundSnapshot {
        uint256 roundId;
        address winner;
        uint256 pot;
        uint256 prize;
        uint256 devFee;
        uint256 startedAt;
        uint256 endedAt;
        uint256 finalizedAt;
        uint256 ticketCount;
        bool cancelled;
    }

    address public immutable devWallet;

    uint256 public roundId;
    uint256 public roundStartedAt;
    uint256 public roundEndsAt;
    address public lastHero;
    uint256 public pot;
    uint256 public ticketCount;

    mapping(uint256 round => RoundSnapshot) private _rounds;

    event RoundStarted(uint256 indexed roundId, uint256 startedAt, uint256 endsAt);
    event TicketPurchased(
        uint256 indexed roundId,
        address indexed buyer,
        uint256 paid,
        uint256 potAfter,
        uint256 ticketCount,
        uint256 endsAt,
        uint256 purchasedAt
    );
    event RoundEnded(
        uint256 indexed roundId,
        address indexed winner,
        uint256 pot,
        uint256 prize,
        uint256 devFee,
        uint256 ticketCount,
        uint256 startedAt,
        uint256 endedAt,
        uint256 finalizedAt
    );
    event RoundCancelled(
        uint256 indexed roundId, uint256 startedAt, uint256 endedAt, uint256 finalizedAt
    );

    error ZeroDevWallet();
    error IncorrectTicketPrice();
    error RoundExpired();
    error RoundStillActive();
    error RoundNotFound();
    error TransferFailed(address to, uint256 amount);
    error DirectPaymentsDisabled();

    constructor(address devWallet_) {
        if (devWallet_ == address(0)) revert ZeroDevWallet();
        devWallet = devWallet_;
        _startNextRound();
    }

    function buyTicket() external payable nonReentrant {
        if (msg.value != TICKET_PRICE) revert IncorrectTicketPrice();
        if (block.timestamp >= roundEndsAt) revert RoundExpired();

        lastHero = msg.sender;
        unchecked {
            pot += msg.value;
            ticketCount += 1;
        }

        uint256 extendedEndsAt = roundEndsAt + EXTENSION;
        uint256 maxEndsAt = block.timestamp + MAX_ENDS_AT_FROM_NOW;
        if (extendedEndsAt > maxEndsAt) {
            extendedEndsAt = maxEndsAt;
        }
        roundEndsAt = extendedEndsAt;

        emit TicketPurchased(
            roundId, msg.sender, msg.value, pot, ticketCount, roundEndsAt, block.timestamp
        );
    }

    function endRound() external nonReentrant {
        if (block.timestamp < roundEndsAt) revert RoundStillActive();

        uint256 endedRoundId = roundId;
        uint256 startedAt = roundStartedAt;
        uint256 endedAt = roundEndsAt;
        uint256 finalizedAt = block.timestamp;
        uint256 tickets = ticketCount;

        if (tickets == 0) {
            _rounds[endedRoundId] = RoundSnapshot({
                roundId: endedRoundId,
                winner: address(0),
                pot: 0,
                prize: 0,
                devFee: 0,
                startedAt: startedAt,
                endedAt: endedAt,
                finalizedAt: finalizedAt,
                ticketCount: 0,
                cancelled: true
            });
            emit RoundCancelled(endedRoundId, startedAt, endedAt, finalizedAt);
            _startNextRound();
            return;
        }

        address winner = lastHero;
        uint256 roundPot = pot;
        uint256 prize = (roundPot * PRIZE_BPS) / BPS_DENOMINATOR;
        uint256 devFee = roundPot - prize;

        _rounds[endedRoundId] = RoundSnapshot({
            roundId: endedRoundId,
            winner: winner,
            pot: roundPot,
            prize: prize,
            devFee: devFee,
            startedAt: startedAt,
            endedAt: endedAt,
            finalizedAt: finalizedAt,
            ticketCount: tickets,
            cancelled: false
        });

        emit RoundEnded(
            endedRoundId, winner, roundPot, prize, devFee, tickets, startedAt, endedAt, finalizedAt
        );

        _startNextRound();
        _sendValue(winner, prize);
        _sendValue(devWallet, devFee);
    }

    function currentRound()
        external
        view
        returns (
            uint256 id,
            uint256 startedAt,
            uint256 endsAt,
            address hero,
            uint256 currentPot,
            uint256 tickets,
            bool expired
        )
    {
        return (
            roundId,
            roundStartedAt,
            roundEndsAt,
            lastHero,
            pot,
            ticketCount,
            block.timestamp >= roundEndsAt
        );
    }

    function getRound(uint256 id) external view returns (RoundSnapshot memory snapshot) {
        if (id == 0 || id >= roundId) revert RoundNotFound();
        snapshot = _rounds[id];
    }

    receive() external payable {
        revert DirectPaymentsDisabled();
    }

    function _startNextRound() private {
        unchecked {
            roundId += 1;
        }
        roundStartedAt = block.timestamp;
        roundEndsAt = block.timestamp + INITIAL_DURATION;
        lastHero = address(0);
        pot = 0;
        ticketCount = 0;

        emit RoundStarted(roundId, roundStartedAt, roundEndsAt);
    }

    function _sendValue(address to, uint256 amount) private {
        if (amount == 0) return;
        (bool ok,) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed(to, amount);
    }
}
