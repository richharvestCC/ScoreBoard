#!/bin/bash

# PR 자동 리뷰 및 수정 워크플로우
# 사용법: ./pr_workflow.sh <PR_NUMBER>

PR_NUMBER=$1
MAX_ITERATIONS=5
CURRENT_ITERATION=0

if [ -z "$PR_NUMBER" ]; then
    echo "❌ 사용법: ./pr_workflow.sh <PR_NUMBER>"
    exit 1
fi

echo "🚀 PR #$PR_NUMBER 자동 리뷰 워크플로우 시작"
echo "================================================"

# GitHub PR 체크아웃
checkout_pr() {
    echo "📥 PR #$PR_NUMBER 체크아웃 중..."
    gh pr checkout $PR_NUMBER
    if [ $? -ne 0 ]; then
        echo "❌ PR 체크아웃 실패"
        exit 1
    fi
}

# 초기 리뷰 분석 및 적용 여부 결정
analyze_reviews() {
    echo ""
    echo "🔍 PR #$PR_NUMBER 리뷰 분석 중..."
    echo "========================================="
    
    # GitHub PR 리뷰 피드백 가져오기
    echo "📋 PR 리뷰 피드백 수집 중..."
    PR_REVIEWS=$(gh pr view $PR_NUMBER --json reviews --jq '.reviews[].body')
    
    if [ -z "$PR_REVIEWS" ]; then
        echo "📝 리뷰 피드백이 없습니다."
        read -p "리뷰 없이 진행하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "🛑 워크플로우 중단"
            exit 0
        fi
        return 0
    fi
    
    # sequential-thinking으로 리뷰 분석
    echo "🧠 AI 분석 중 (sequential-thinking)..."
    ANALYSIS_RESULT=$(claude "@seq 다음 PR 리뷰들을 분석해서 워크플로우 적용 여부를 결정해줘:

리뷰 내용:
$PR_REVIEWS

분석 기준:
1. Critical/High Priority 이슈가 있는가?
2. 자동화로 해결 가능한 이슈인가?
3. 수동 개입이 필요한 복잡한 이슈는 없는가?
4. 예상 수정 시간과 리스크는?

결론을 PROCEED (진행) 또는 SKIP (건너뛰기) 중 하나로 명확히 답변하고, 
그 이유를 간단히 설명해줘.")
    
    echo ""
    echo "📊 분석 결과:"
    echo "----------------------------------------"
    echo "$ANALYSIS_RESULT"
    echo "----------------------------------------"
    
    # 분석 결과에 따른 진행 여부 결정
    if echo "$ANALYSIS_RESULT" | grep -qi "PROCEED"; then
        echo "✅ 워크플로우 진행 결정됨"
        
        # 사용자 확인
        read -p "자동 수정을 진행하시겠습니까? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            echo "🛑 사용자가 진행을 취소했습니다."
            exit 0
        fi
        
        return 0
    elif echo "$ANALYSIS_RESULT" | grep -qi "SKIP"; then
        echo "⏭️ 워크플로우 건너뛰기 권장됨"
        
        read -p "그래도 강제로 진행하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "🛑 워크플로우 건너뛰기"
            exit 0
        fi
        
        echo "⚠️ 강제 진행합니다..."
        return 0
    else
        echo "❓ 분석 결과가 불명확합니다."
        
        read -p "수동으로 진행 여부를 결정하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "🛑 워크플로우 중단"
            exit 0
        fi
        
        return 0
    fi
}

# Agent들이 순차적으로 Critical/High Priority 이슈 처리
process_issues() {
    local iteration=$1
    echo ""
    echo "🔄 반복 $iteration/$MAX_ITERATIONS 시작"
    echo "----------------------------------------"
    
    # GitHub PR 리뷰 피드백 가져오기
    echo "📋 PR 리뷰 피드백 가져오는 중..."
    PR_REVIEWS=$(gh pr view $PR_NUMBER --json reviews --jq '.reviews[].body')
    
    # 1. oil-paint Agent (Frontend 이슈 처리)
    echo "🎨 Frontend Agent (oil-paint) 실행 중..."
    claude "@agent-oil-paint 다음 PR 리뷰 피드백에서 Critical, High Priority frontend 이슈들을 찾아서 수정해줘: 

$PR_REVIEWS

React, TypeScript, MUI 관련 문제에 집중해."
    
    if [ $? -ne 0 ]; then
        echo "⚠️ Frontend Agent 실행 실패"
        return 1
    fi
    
    # 2. my-mom Agent (Backend 이슈 처리)  
    echo "⚙️ Backend Agent (my-mom) 실행 중..."
    claude "@agent-my-mom 다음 PR 리뷰 피드백에서 Critical, High Priority backend 이슈들을 찾아서 수정해줘:

$PR_REVIEWS

Node.js, Express, Sequelize, PostgreSQL 관련 문제에 집중해."
    
    if [ $? -ne 0 ]; then
        echo "⚠️ Backend Agent 실행 실패"
        return 1
    fi
    
    # 3. big-cctv Agent (보안 이슈 처리)
    echo "🔒 Security Agent (big-cctv) 실행 중..."
    claude "@agent-big-cctv 다음 PR 리뷰 피드백에서 Critical, High Priority 보안 이슈들을 찾아서 수정해줘:

$PR_REVIEWS

JWT, XSS, SQL Injection, 인증/인가 문제에 집중해."
    
    if [ $? -ne 0 ]; then
        echo "⚠️ Security Agent 실행 실패"  
        return 1
    fi
    
    # 4. watch-dog Agent (최종 검증)
    echo "🔍 Watch-dog Agent 최종 검증 실행 중..."
    VALIDATION_RESULT=$(claude "@agent-watch-dog 모든 변경사항을 종합적으로 검토하고 Critical, High Priority 이슈가 남아있는지 확인해줘. 결과를 PASS 또는 FAIL로 명확히 답변해.")
    
    if [ $? -ne 0 ]; then
        echo "⚠️ Watch-dog Agent 실행 실패"
        return 1
    fi
    
    # 검증 결과 확인
    if echo "$VALIDATION_RESULT" | grep -qi "PASS"; then
        echo "✅ 모든 Critical/High Priority 이슈 해결 완료"
        return 0
    elif echo "$VALIDATION_RESULT" | grep -qi "FAIL"; then
        echo "❌ 아직 Critical/High Priority 이슈가 남아있음"
        return 2
    else
        echo "⚠️ 검증 결과가 불명확함"
        return 2
    fi
}

# 변경사항 커밋
commit_changes() {
    echo ""
    echo "💾 변경사항 커밋 중..."
    
    # 변경된 파일이 있는지 확인
    if [ -z "$(git diff --name-only)" ] && [ -z "$(git diff --cached --name-only)" ]; then
        echo "📝 변경사항이 없습니다."
        return 0
    fi
    
    # 모든 변경사항 스테이징
    git add .
    
    # 커밋 메시지 생성
    COMMIT_MSG="fix: resolve Critical/High Priority issues from PR #$PR_NUMBER

- Frontend issues fixed by oil-paint agent
- Backend issues fixed by my-mom agent  
- Security issues fixed by big-cctv agent
- Validated by watch-dog agent

Auto-generated by PR workflow script"

    git commit -m "$COMMIT_MSG"
    
    if [ $? -eq 0 ]; then
        echo "✅ 커밋 완료"
        
        # 원격에 푸시 (선택사항)
        read -p "원격 저장소에 푸시하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push
            echo "✅ 푸시 완료"
        fi
        return 0
    else
        echo "❌ 커밋 실패"
        return 1
    fi
}

# 다음 PR로 이동
move_to_next_pr() {
    echo ""
    echo "➡️ 다음 PR 찾는 중..."
    
    # 다음 PR 번호 찾기 (간단한 구현)
    NEXT_PR=$((PR_NUMBER + 1))
    
    # PR 존재 여부 확인
    gh pr view $NEXT_PR > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "📋 다음 PR #$NEXT_PR 발견"
        read -p "다음 PR #$NEXT_PR을 처리하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            exec $0 $NEXT_PR  # 재귀적으로 다음 PR 처리
        fi
    else
        echo "📝 처리할 다음 PR이 없습니다."
    fi
}

# 메인 워크플로우 실행
main() {
    # 필수 도구 확인
    if ! command -v claude &> /dev/null; then
        echo "❌ Claude CLI가 설치되어 있지 않습니다."
        echo "설치 방법: https://claude.ai/code"
        exit 1
    fi
    
    if ! command -v gh &> /dev/null; then
        echo "❌ GitHub CLI가 설치되어 있지 않습니다."
        echo "설치 방법: brew install gh"
        exit 1
    fi
    
    # Claude CLI 테스트
    echo "🧪 Claude CLI 연결 테스트..."
    echo "test" | claude > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "❌ Claude CLI 연결 실패. 인증을 확인해주세요."
        exit 1
    fi
    
    # 임시 파일 정리 함수 등록
    trap 'rm -f /tmp/*_task.txt /tmp/*_result.txt' EXIT
    
    # PR 체크아웃
    checkout_pr
    
    # 초기 리뷰 분석 및 적용 여부 결정
    analyze_reviews
    
    # 반복적으로 이슈 처리
    while [ $CURRENT_ITERATION -lt $MAX_ITERATIONS ]; do
        CURRENT_ITERATION=$((CURRENT_ITERATION + 1))
        
        process_issues $CURRENT_ITERATION
        RESULT=$?
        
        if [ $RESULT -eq 0 ]; then
            # 성공: 모든 이슈 해결
            echo ""
            echo "🎉 PR #$PR_NUMBER 모든 Critical/High Priority 이슈 해결 완료!"
            commit_changes
            move_to_next_pr
            exit 0
        elif [ $RESULT -eq 1 ]; then
            # Agent 실행 실패
            echo "❌ Agent 실행 중 오류 발생."
            echo "로그 파일을 확인하세요:"
            echo "  - /tmp/frontend_result.txt"
            echo "  - /tmp/backend_result.txt" 
            echo "  - /tmp/security_result.txt"
            echo "  - /tmp/validation_result.txt"
            exit 1
        elif [ $RESULT -eq 2 ]; then
            # 아직 이슈가 남아있음 - 다음 반복 진행
            echo "🔄 이슈가 남아있어 다음 반복을 진행합니다..."
            sleep 5
        fi
    done
    
    # 최대 반복 횟수 도달
    echo ""
    echo "⚠️ 최대 반복 횟수($MAX_ITERATIONS)에 도달했습니다."
    echo "수동으로 남은 이슈를 확인해주세요."
    echo "로그 파일 위치: /tmp/*_result.txt"
    exit 1
}

# 스크립트 시작
main