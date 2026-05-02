#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <set>
#include <map>
#include <string>
#include <algorithm>

using namespace std;

typedef set<string> Transaction;
typedef vector<string> Itemset;

vector<Transaction> readTransactions(const string& filename) {
    vector<Transaction> transactions;
    ifstream in(filename);
    if (!in) {
        cerr << "{\"error\":\"Cannot open file: " << filename << "\"}";
        exit(1);
    }
    string line;
    while (getline(in, line)) {
        for (char& c : line) if (c == ',' || c == ';' || c == '\t') c = ' ';
        stringstream ss(line);
        Transaction t;
        string item;
        while (ss >> item) {
            if (!item.empty()) t.insert(item);
        }
        if (!t.empty()) transactions.push_back(t);
    }
    return transactions;
}

int supportCount(const Itemset& itemset, const vector<Transaction>& transactions) {
    int count = 0;
    for (const auto& t : transactions) {
        bool contained = true;
        for (const auto& item : itemset) {
            if (t.find(item) == t.end()) { contained = false; break; }
        }
        if (contained) count++;
    }
    return count;
}

vector<Itemset> generateL1(const vector<Transaction>& transactions, int minSup,
                           map<Itemset,int>& support) {
    map<string,int> itemCount;
    for (const auto& t : transactions)
        for (const auto& item : t)
            itemCount[item]++;

    vector<Itemset> L1;
    for (auto& kv : itemCount) {
        if (kv.second >= minSup) {
            Itemset s = { kv.first };
            L1.push_back(s);
            support[s] = kv.second;
        }
    }
    sort(L1.begin(), L1.end());
    return L1;
}

vector<Itemset> aprioriGen(const vector<Itemset>& Lprev) {
    vector<Itemset> Ck;
    int n = Lprev.size();
    int k = Lprev.empty() ? 0 : (int)Lprev[0].size();

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            bool matchPrefix = true;
            for (int p = 0; p < k - 1; p++) {
                if (Lprev[i][p] != Lprev[j][p]) { matchPrefix = false; break; }
            }
            if (!matchPrefix) continue;
            if (Lprev[i][k-1] >= Lprev[j][k-1]) continue;

            Itemset candidate = Lprev[i];
            candidate.push_back(Lprev[j][k-1]);
            Ck.push_back(candidate);
        }
    }
    return Ck;
}

vector<Itemset> pruneCandidates(const vector<Itemset>& Ck, const vector<Itemset>& Lprev) {
    set<Itemset> Lset(Lprev.begin(), Lprev.end());
    vector<Itemset> pruned;
    for (const auto& c : Ck) {
        bool keep = true;
        for (size_t i = 0; i < c.size(); i++) {
            Itemset subset;
            for (size_t j = 0; j < c.size(); j++)
                if (j != i) subset.push_back(c[j]);
            if (Lset.find(subset) == Lset.end()) { keep = false; break; }
        }
        if (keep) pruned.push_back(c);
    }
    return pruned;
}

string jsonEscape(const string& s) {
    string out;
    for (char c : s) {
        if (c == '"' || c == '\\') { out.push_back('\\'); out.push_back(c); }
        else if (c == '\n') out += "\\n";
        else out.push_back(c);
    }
    return out;
}

string itemsetToJson(const Itemset& s) {
    string out = "[";
    for (size_t i = 0; i < s.size(); i++) {
        if (i) out += ",";
        out += "\"" + jsonEscape(s[i]) + "\"";
    }
    out += "]";
    return out;
}

int main(int argc, char* argv[]) {
    if (argc < 3) {
        cerr << "{\"error\":\"Usage: apriori <dataset> <min_support_count>\"}";
        return 1;
    }
    string filename = argv[1];
    int minSup = atoi(argv[2]);
    if (minSup < 1) minSup = 1;

    vector<Transaction> transactions = readTransactions(filename);
    int N = (int)transactions.size();

    map<Itemset,int> support;
    vector<Itemset> L1 = generateL1(transactions, minSup, support);

    vector<vector<Itemset>> allL;
    allL.push_back(L1);

    vector<Itemset> Lprev = L1;
    while (!Lprev.empty()) {
        vector<Itemset> Ck = aprioriGen(Lprev);
        Ck = pruneCandidates(Ck, Lprev);

        vector<Itemset> Lk;
        for (const auto& c : Ck) {
            int cnt = supportCount(c, transactions);
            if (cnt >= minSup) {
                Lk.push_back(c);
                support[c] = cnt;
            }
        }
        if (Lk.empty()) break;
        allL.push_back(Lk);
        Lprev = Lk;
    }

    cout << "{";
    cout << "\"transactions\":" << N << ",";
    cout << "\"minSupport\":" << minSup << ",";
    cout << "\"levels\":[";
    for (size_t k = 0; k < allL.size(); k++) {
        if (k) cout << ",";
        cout << "{\"k\":" << (k+1) << ",\"itemsets\":[";
        for (size_t i = 0; i < allL[k].size(); i++) {
            if (i) cout << ",";
            cout << "{\"items\":" << itemsetToJson(allL[k][i])
                 << ",\"support\":" << support[allL[k][i]] << "}";
        }
        cout << "]}";
    }
    cout << "]}";
    return 0;
}
