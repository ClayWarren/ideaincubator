// api/rank.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { idea, action, scores } = req.body;
    if (!idea) {
        return res.status(400).json({ error: 'Idea is required' });
    }

    try {
        // Simulated xAI API call (replace with real API logic)
        if (action === 'rank') {
            // Fake AI scoring (replace with real xAI API call)
            const words = idea.toLowerCase().split(' ');
            const marketScore = Math.min(10, (words.includes('global') || words.includes('everyone') ? 8 : 5) + Math.floor(Math.random() * 3));
            const feasScore = Math.min(10, (words.includes('ai') || words.includes('simple') ? 7 : 4) + Math.floor(Math.random() * 3));
            const profitScore = Math.min(10, (words.includes('subscription') || words.includes('revenue') ? 8 : 5) + Math.floor(Math.random() * 3));
            const totalScore = Math.round((marketScore * 0.4 + feasScore * 0.3 + profitScore * 0.3) * 10) / 10;

            return res.status(200).json({ marketScore, feasScore, profitScore, totalScore });
        } else if (action === 'tweak' && scores) {
            // Fake AI tweaking (replace with real xAI API call)
            const { market, feas, profit } = scores;
            const lowest = Math.min(market, feas, profit);
            let tweak = '';
            if (lowest === market) {
                tweak = market < 7 ? 'Expand to a broader, global audience to boost reach.' : 'Target a specific, high-demand niche for better focus.';
            } else if (lowest === feas) {
                tweak = feas < 7 ? 'Simplify with existing tools or AI to reduce complexity.' : 'Streamline execution for faster rollout.';
            } else {
                tweak = profit < 7 ? 'Incorporate a subscription or scalable revenue model.' : 'Optimize pricing or add upsells for higher margins.';
            }

            return res.status(200).json({ tweak });
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
