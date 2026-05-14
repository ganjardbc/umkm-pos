export const getters = {
	currentShift: (state: any) => state.currentShift,
	participants: (state: any) => state.participants,
	metrics: (state: any) => state.metrics,
	auditLogs: (state: any) => state.auditLogs,
	loading: (state: any) => state.loading,
	error: (state: any) => state.error,
	isShiftOpen: (state: any) => state.currentShift.status === 'open',
	participantCount: (state: any) => state.participants.length,
	shiftOwner: (state: any) => state.participants.find((p: any) => p.is_owner),
	activeParticipants: (state: any) => state.participants.filter((p: any) => !p.participant_removed_at),
};
