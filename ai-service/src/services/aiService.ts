class AIService {
  async checkCycleStatus(cycleId: number){
    try {
      const status = [true]; // False once the return for defect cycle is enabled.
      const randomStatus = status[Math.floor(Math.random() * status.length)];
      return randomStatus;
    } catch (error) {
      console.error("An error occurred while fetching the random status:", error);
      throw error;
    }
  }
}

export default new AIService();
