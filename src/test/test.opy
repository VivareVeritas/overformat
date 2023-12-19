#!mainFile "../main.opy"
rule "@Main_Events Player Dealt Damage":
@Event playerDealtDamage
@Hero ana
@Condition attacker != victim == true
@Condition eventPlayer.IsLoadingIn == false


#Track First kill time for stats:
	if eventPlayer.FirstKillTime == 0:
	eventPlayer.FirstKillTime = getTotalTimeElapsed()
	
	#Track Sleep Kills
		if eventAbility == Button.ABILITY_1:
		playEffect(getAllPlayers(), DynamicEffect.GOOD_PICKUP_EFFECT, rgb(254, 163, 170), eventPlayer, 1)
		eventPlayer.SleepKills += 1
			if random.randint(0, 1) < 1:
			attacker.communicate(Comms.SORRY)
			
			#Track Unscoped Kills
				if eventAbility == Button.PRIMARY_FIRE and not eventPlayer.isFiringSecondaryFire():
				playEffect(getAllPlayers(), DynamicEffect.GOOD_PICKUP_EFFECT, rgb(254, 163, 170), eventPlayer, 1)
				eventPlayer.UnScopedKills += 1
					if random.randint(0, 1) < 1:
					attacker.communicate(Comms.THANKS)
					
					#Track Melee Kills
						if eventAbility == Button.MELEE:
						playEffect(getAllPlayers(), DynamicEffect.GOOD_PICKUP_EFFECT, rgb(250, 248, 132), eventPlayer, 1)
						eventPlayer.MeleeKills += 1
						#CALC MELEE SO AS NOT TO DO IT TOO FREQUENTLY
						HighestMeleePlayer = sorted([player for player in getAllPlayers() if player.MeleeKills >= OptionMeleeRequiredForScore ], lambda player: player.MeleeKills / (getTotalTimeElapsed() - player.FirstKillTime)).last():
						HighestMeleeValue = HighestMeleePlayer.MeleeKills / (getTotalTimeElapsed() - HighestMeleePlayer.FirstKillTime)*60
							if random.randint(0, 1) < 1:
						attacker.communicate(Comms.GOODBYE)
						
						#End game or start sleep final kill based on score
							if not OptionNoKillLimit:
								if eventPlayer.getScore() >= OptionGameLengthKills:
								declarePlayerVictory(eventPlayer)
								wait(4.1)
								restartMatch()
									if eventPlayer.getScore() == OptionGameLengthKills-1:
									bigMessage(getAllPlayers().exclude(eventPlayer), "{0}  {1} wins in 1 kill  {0}".format(iconString(Icon.WARNING), eventPlayer)):
										if OptionLastKillSleep:
										async(setSleepKill,AsyncBehavior.RESTART)
										
										
										#instakill
										kill(victim, attacker)