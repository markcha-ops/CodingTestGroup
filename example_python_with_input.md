# Python input() 함수 지원 예시

## 문제 예시
사용자로부터 두 개의 정수를 입력받아 합을 출력하는 프로그램을 작성하세요.

### 입력
```
5
3
```

### 출력
```
8
```

## 학생 코드 예시
```python
a = int(input())
b = int(input())
print(a + b)
```

## 문제 설정 방법

1. **문제 내용**: 위의 문제 설명을 Markdown으로 작성
2. **테스트 입력 데이터**: 
   ```
   5
   3
   ```
3. **정답 문자열**: `8`
4. **언어**: Python

## 시스템 동작 방식

1. 사용자가 코드를 제출하면 시스템이 입력 데이터를 `input.txt` 파일로 생성
2. Docker 컨테이너에서 `python main.py < input.txt` 명령으로 실행
3. 프로그램의 출력을 정답과 비교하여 채점

## 더 복잡한 예시

### 문제: 여러 개의 입력 처리
```python
n = int(input())
numbers = []
for i in range(n):
    numbers.append(int(input()))
print(sum(numbers))
```

### 테스트 입력 데이터:
```
3
10
20
30
```

### 정답: `60`

이제 Python의 input() 함수를 사용하는 문제도 정상적으로 채점할 수 있습니다! 