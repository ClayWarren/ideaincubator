// api/rank.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { idea, action, scores } = req.body;
    if (!idea) {
        return res.status(400).json({ error: 'Idea is required' });
    }

    const apiToken = process.env.HUGGING_FACE_API_TOKEN; // Set in Vercel env vars
    const apiUrl = 'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english';

    try {
        if (action === 'rank') {
            // Call Hugging Face API for sentiment analysis
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: idea })
            });
            const data = await response.json();
            if (!response.ok || !data[0]) throw new Error('API response invalid');

            // Extract sentiment score (0-1) and map to scores
            const sentiment = data[0].find(s => s.label === 'POSITIVE')?.score || 0.5;
            const baseScore = Math.round(sentiment * 10); // 0-10 scale
            const marketScore = Math.min(10, baseScore + (idea.toLowerCase().includes('global') ? 2 : 0));
            const feasScore = Math.min(10, baseScore + (idea.toLowerCase().includes('ai') ? 1 : 0));
            const profitScore = Math.min(10, baseScore + (idea.toLowerCase().includes('subscription') ? 2 : 0));
            const totalScore = Math.round((marketScore * 0.4 + feasScore * 0.3 + profitScore * 0.3) * 10) / 10;

            return res.status(200).json({ marketScore, feasScore, profitScore, totalScore });
        } else if (action === 'tweak' && scores) {
            // Call Hugging Face API again for tweak suggestion
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: `Improve this idea: ${idea}` })
            });
            const data = await response.json();
            if (!response.ok || !data[0]) throw new Error('API response invalid');

            const sentiment = data[0].find(s => s.label === 'POSITIVE')?.score || 0.5;
            const { market, feas, profit } = scores;
            const lowest = Math.min(market, feas, profit);
            let tweak = '';
            if (lowest === market) {
                tweak = market < 7 ? 'Expand to a broader audience for greater impact.' : 'Focus on a niche market to stand out.';
            } else if (lowest === feas) {
                tweak = feas < 7 ? 'Simplify implementation with existing tools.' : 'Optimize for faster execution.';
            } else {
                tweak = profit < 7 ? 'Add a scalable revenue stream like subscriptions.' : 'Enhance profitability with upsells.';
            }
            // Adjust tweak based on sentiment (rudimentary)
            tweak = sentiment < 0.5 ? `${tweak} Consider rethinking the core concept.` : tweak;

            return res.status(200).json({ tweak });
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
