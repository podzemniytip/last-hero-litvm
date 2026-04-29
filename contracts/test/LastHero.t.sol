// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LastHero} from "../src/LastHero.sol";

interface Vm {
    function deal(address account, uint256 amount) external;
    function expectEmit(bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData)
        external;
    function expectRevert(bytes4 selector) external;
    function prank(address account) external;
    function warp(uint256 timestamp) external;
}

contract ReentrantWinner {
    LastHero public immutable game;
    bool public reentryBlocked;

    constructor(LastHero game_) {
        game = game_;
    }

    function buy() external payable {
        game.buyTicket{value: msg.value}();
    }

    receive() external payable {
        try game.endRound() {
            reentryBlocked = false;
        } catch {
            reentryBlocked = true;
        }
    }
}

contract LastHeroTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

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

    LastHero private game;
    address private dev = address(0xD00D);
    address private alice = address(0xA11CE);
    address private bob = address(0xB0B);
    address private carol = address(0xCA501);

    function setUp() public {
        game = new LastHero(dev);
        vm.deal(address(this), 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
    }

    function testConstructorStartsRound() public view {
        _assertEq(game.roundId(), 1, "round id");
        _assertEq(game.roundEndsAt(), game.roundStartedAt() + 30 minutes, "initial ends");
        _assertEq(game.devWallet(), dev, "dev wallet");
    }

    function testRequiresExactTicketPrice() public {
        uint256 ticketPrice = game.TICKET_PRICE();

        vm.expectRevert(LastHero.IncorrectTicketPrice.selector);
        game.buyTicket{value: 0.009 ether}();

        vm.prank(alice);
        game.buyTicket{value: ticketPrice}();
        _assertEq(game.lastHero(), alice, "hero");
        _assertEq(game.pot(), ticketPrice, "pot");
    }

    function testBuyTicketEmitsAndExtendsTimer() public {
        uint256 ticketPrice = game.TICKET_PRICE();
        uint256 oldEndsAt = game.roundEndsAt();
        uint256 expectedEndsAt = oldEndsAt + 5 minutes;

        vm.expectEmit(true, true, false, true);
        emit TicketPurchased(1, alice, ticketPrice, ticketPrice, 1, expectedEndsAt, block.timestamp);
        vm.prank(alice);
        game.buyTicket{value: ticketPrice}();

        _assertEq(game.roundEndsAt(), expectedEndsAt, "extended");
        _assertEq(game.ticketCount(), 1, "ticket count");
    }

    function testExtensionIsCappedAtOneHourFromNow() public {
        uint256 ticketPrice = game.TICKET_PRICE();
        for (uint256 i = 0; i < 12; i++) {
            vm.prank(alice);
            game.buyTicket{value: ticketPrice}();
        }

        _assertEq(game.roundEndsAt(), block.timestamp + 1 hours, "capped at one hour");
    }

    function testCannotBuyAfterExpiryUntilEndRound() public {
        uint256 ticketPrice = game.TICKET_PRICE();
        vm.warp(game.roundEndsAt());
        vm.expectRevert(LastHero.RoundExpired.selector);
        game.buyTicket{value: ticketPrice}();

        game.endRound();
        _assertEq(game.roundId(), 2, "new round");
    }

    function testCannotEndActiveRound() public {
        vm.expectRevert(LastHero.RoundStillActive.selector);
        game.endRound();
    }

    function testEndRoundPaysWinnerAndDevThenRestarts() public {
        uint256 ticketPrice = game.TICKET_PRICE();

        vm.prank(alice);
        game.buyTicket{value: ticketPrice}();
        vm.prank(bob);
        game.buyTicket{value: ticketPrice}();

        uint256 bobBefore = bob.balance;
        uint256 devBefore = dev.balance;
        uint256 endedAt = game.roundEndsAt();
        vm.warp(endedAt);

        vm.expectEmit(true, true, false, true);
        emit RoundEnded(
            1,
            bob,
            0.02 ether,
            0.018 ether,
            0.002 ether,
            2,
            game.roundStartedAt(),
            endedAt,
            endedAt
        );
        game.endRound();

        _assertEq(bob.balance, bobBefore + 0.018 ether, "winner prize");
        _assertEq(dev.balance, devBefore + 0.002 ether, "dev fee");
        _assertEq(game.roundId(), 2, "restarted");
        _assertEq(game.pot(), 0, "new pot");
        _assertEq(game.ticketCount(), 0, "new tickets");

        LastHero.RoundSnapshot memory round = game.getRound(1);
        _assertEq(round.winner, bob, "snapshot winner");
        _assertEq(round.pot, 0.02 ether, "snapshot pot");
    }

    function testNoTicketRoundRestartsWithoutPayout() public {
        uint256 devBefore = dev.balance;
        vm.warp(game.roundEndsAt());
        game.endRound();

        _assertEq(dev.balance, devBefore, "dev unchanged");
        _assertEq(game.roundId(), 2, "new round id");

        LastHero.RoundSnapshot memory round = game.getRound(1);
        _assertTrue(round.cancelled, "cancelled");
        _assertEq(round.pot, 0, "no pot");
    }

    function testPayoutReentrancyIsBlocked() public {
        ReentrantWinner attacker = new ReentrantWinner(game);
        vm.deal(address(attacker), 1 ether);

        attacker.buy{value: game.TICKET_PRICE()}();
        vm.warp(game.roundEndsAt());
        game.endRound();

        _assertTrue(attacker.reentryBlocked(), "reentry blocked");
        _assertEq(game.roundId(), 2, "single restart");
    }

    function _assertEq(uint256 actual, uint256 expected, string memory message) internal pure {
        require(actual == expected, message);
    }

    function _assertEq(address actual, address expected, string memory message) internal pure {
        require(actual == expected, message);
    }

    function _assertTrue(bool value, string memory message) internal pure {
        require(value, message);
    }
}
