class AIService {
  async checkCycleStatus(cycleId: number) {
    try {
      const status = [true, false];
      const randomStatus = status[Math.floor(Math.random() * status.length)];
      return randomStatus;
    } catch (error) {
      console.error(
        "An error occurred while fetching the random status:",
        error
      );
      throw error;
    }
  }
}

export default new AIService();
