(function () {
	function addEvent(c, a, b) { if (c.addEventListener) { c.addEventListener(a, b, false) } else { if (c.attachEvent) { c.attachEvent("on" + a, b) } } } function e(a) { var b = (typeof a == "string") ? document.getElementById(a) : a; if (b == null) { return } if (!b.getText) { b.getText = function () { return b.value || b.textContent || b.innerText } } if (!b.setText) { b.setText = function (c) { if (b.value != null) { b.value = c } else { if (b.textContent != null) { b.textContent = c } else { if (b.innerText != null) { b.innerText = c } } } } } return b };

	var KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_LEFT = 37;

	var Charactor = function (chr_) {
		this.chr = chr_;
		this.img = null;
		this.x = 0;
		this.y = 0;
		this.ascii_x = 0;
		this.ascii_y = 0;
		this.muki = 'e';
	}

	Charactor.prototype = {
		moveTo: function (x_, y_) {
			var dx = x_ - this.x;
			var dy = y_ - this.y;
			this.moveBy(dx, dy);
			this.x = x_;
			this.y = y_;
		},

		moveBy: function (dx_, dy_) {

			if (dx_ < 0) {
				this.img.src = 'player3.png';
			}
			if (0 < dx_) {
				this.img.src = 'player4.png';
			}
			if (dy_ < 0) {
				this.img.src = 'player2.png';
			}
			if (0 < dy_) {
				this.img.src = 'player1.png';
			}

			this.x += dx_;
			this.y += dy_;
			this.asciiPos();
			this.refrectStyle();
		},

		// private
		asciiPos: function (dx_, dy_) {
			this.ascii_x = Math.floor((this.x) / 16);
			this.ascii_y = Math.floor((this.y) / 32);
		},

		refrectStyle: function () {
			this.img.style.left = this.x + 'px';
			this.img.style.top = this.y + 'px';
		}
	}


	addEvent(window, 'load', function () {
		var koukoku = document.getElementById('y_gc_div_uadcntr');
		if (koukoku != null) {
			koukoku.style.zIndex = 0;
			koukoku.style.position = 'absolute';
			koukoku.style.top = '600px';
		}


		var divframe = document.getElementById('debug');
		divframe.style.position = 'absolute';
		divframe.style.top = '180px';
		divframe.style.left = '660px';

		document.getElementById('divFieldAscii').style.left = '660px'
		document.getElementById('divObjectAscii').style.left = '660px'

		var _frameTiming = 16;
		var _frameCount;
		var _keyCode;
		var _koudouArray = new Array();
		var _mode;
		var _hensu;
		var _dbg = '';

		var _field1 = new Array();
		_field1.push('**************************      ********');
		_field1.push('*        **                            *');
		_field1.push('*       **    **      ***      ****    *');
		_field1.push('*      **    **    ****************    *');
		_field1.push('********    **     ******  *****       *');
		_field1.push('**          **              ****       *');
		_field1.push('**   ********                          *');
		_field1.push('**   *                                 *');
		_field1.push('**   *                      ***        *');
		_field1.push('**   *                      ***        *');
		_field1.push('*                                      *');
		_field1.push('*                                      *');
		_field1.push('*          ****               **********');
		_field1.push('*          ****               **********');
		_field1.push('****************************************');

		var _field2 = new Array();
		_field2.push('****************************************');
		_field2.push('*                                      *');
		_field2.push('*                                      *');
		_field2.push('*                                      *');
		_field2.push('*                                      *');
		_field2.push('*                                       ');
		_field2.push('*                                       ');
		_field2.push('*                                       ');
		_field2.push('*                                       ');
		_field2.push('*                                      *');
		_field2.push('*                                      *');
		_field2.push('*                                      *');
		_field2.push('*                                      *');
		_field2.push('*                                      *');
		_field2.push('**************************      ********');

		var _field3 = new Array();
		_field3.push('****************************************');
		_field3.push('*                                      *');
		_field3.push('*                                      *');
		_field3.push('*                                      *');
		_field3.push('*                                      *');
		_field3.push('                                       *');
		_field3.push('                                       *');
		_field3.push('                                       *');
		_field3.push('                                       *');
		_field3.push('*                                      *');
		_field3.push('*                                      *');
		_field3.push('*                                      *');
		_field3.push('*                                      *');
		_field3.push('*                                      *');
		_field3.push('****************************************');


		var _field = new Array();
		var _nextField = new Array();
		for (var i = 0; i < _field1.length; i++) {
			_field.push(_field1[i]);
		}
		var _object = new Array();
		for (var i = 0; i < _field.length; i++) {
			_object.push('                                        ');
		}

		var _hougaku = {
			n: { x: 0, y: -1 }, e: { x: 1, y: 0 }, s: { x: 0, y: 1 }, w: { x: -1, y: 0 }
		}

		var bg = document.createElement('IMG');
		bg.src = 'map1.png';
		bg.style.position = 'absolute';

		var nextbg = document.createElement('IMG');
		bg.src = 'map1.png';
		nextbg.style.position = 'absolute';
		nextbg.style.visible = 'none';

		var divField = document.getElementById('divFieldGraph');
		divField.appendChild(bg);
		divField.appendChild(nextbg);

		var c = new Charactor('A');
		var cimg = document.createElement('IMG');
		cimg.style.position = 'absolute';
		cimg.src = 'player.png'

		c.img = cimg;
		c.moveTo(18 * 16, 2 * 32);
		divField.appendChild(cimg);

		put(c);

		display();

		_frameCount = 0;
		_mode = 'free';
		setTimeout(frameCheck, _frameTiming);




		function put(obj) {
			putc(obj.ascii_x, obj.ascii_y, obj.chr);
		}

		function putc(x, y, c) {
			var swp = _object[y];
			swp = swp.substr(0, x) + c + swp.substr(x + 1);
			_object[y] = swp;
		}

		function get(x, y) {
			if (y < 0 || _field.length <= y) {
				return null;
			}
			if (x < 0 || _field[y].length <= x) {
				return null;
			}
			return _field[y].charAt(x);
		}

		function display() {
			document.getElementById('divFieldAscii').innerHTML = _field.join('<br>').replace(/ /g, '&nbsp;');
			document.getElementById('divObjectAscii').innerHTML = _object.join('<br>').replace(/ /g, '&nbsp;');
		}

		addEvent(document, 'keydown', function (e) {
			_keyCode = event.keyCode;
		});

		addEvent(document, 'keyup', function (e) {
			if (event.keyCode == _keyCode) {
				_keyCode = '';
			}
		});

		function frameCheck() {

			_frameCount++;
			document.getElementById('debug').innerHTML =
				_mode + '<br>' + _frameCount + '<br>' + _keyCode
				+ '<br>' + c.x + ',' + c.y
				+ '<br>' + c.ascii_x + ',' + c.ascii_y
				+ '<br>[' + _dbg + ']'
				;

			if (_keyCode == 27) {
				return;
			}

			if (_mode == 'free') {
				if (_frameCount % 2 == 0) {

					if (0 < _koudouArray.length) {

						var koudou = _koudouArray.shift();
						if (koudou.type == 'idou') {

							c.moveBy(koudou.value.x * 4, koudou.value.y * 4);

							if (c.muki == 'n' && c.y <= 0) {
								nextbg.src = 'map2.png';
								nextbg.style.position = 'absolute';
								nextbg.style.top = '-480px';
								nextbg.style.left = '0px';

								bg.style.top = '0px';
								bg.style.left = '0px';

								_nextField = _field2;

								_hensu = { muki: 'n', frame: 0, frameend: 30 };

								nextbg.style.visible = '';

								_mode = 'scrl';
							}
							if (c.muki == 'e' && 640 - 32 <= c.x) {
								nextbg.src = 'map3.png';
								nextbg.style.position = 'absolute';
								nextbg.style.top = '0px';
								nextbg.style.left = '640px';

								bg.style.top = '0px';
								bg.style.left = '0px';

								_nextField = _field3;

								_hensu = { muki: 'e', frame: 0, frameend: 40 };

								nextbg.style.visible = '';

								_mode = 'scrl';
							}
							if (c.muki == 's' && 480 - 32 <= c.y) {
								nextbg.src = 'map1.png';
								nextbg.style.top = '480px';
								nextbg.style.left = '0px';

								bg.style.top = '0px';
								bg.style.left = '0px';

								_nextField = _field1;

								_hensu = { muki: 's', frame: 0, frameend: 30 };

								nextbg.style.visible = '';

								_mode = 'scrl';
							}
							if (c.muki == 'w' && c.x <= 0) {
								nextbg.src = 'map2.png';
								nextbg.style.position = 'absolute';
								nextbg.style.top = '0px';
								nextbg.style.left = '-640px';

								bg.style.top = '0px';
								bg.style.left = '0px';

								_nextField = _field2;

								_hensu = { muki: 'w', frame: 0, frameend: 40 };

								nextbg.style.visible = '';

								_mode = 'scrl';
							}
						}
						if (koudou.type == 'jump') {
							c.moveBy(0, koudou.value);
						}
					}

					put(c);
					display();

					if (_mode != 'scrl') {
						if (_keyCode == KEY_UP) {
							move_tate('n');
						}
						if (_keyCode == KEY_RIGHT) {
							move_yoko('e');
						}
						if (_keyCode == KEY_DOWN) {
							move_tate('s');
						}
						if (_keyCode == KEY_LEFT) {
							move_yoko('w');
						}
					}
				}
			} else
				if (_mode == 'scrl') {
					if (_hensu.frame == 0) {
						putc(c.ascii_x, c.ascii_y, ' ');
					}

					_hensu.frame++;
					if (_hensu.muki == 'n') {
						nextbg.style.top = (-480 + 16 * _hensu.frame) + 'px';
						bg.style.top = (0 + 16 * _hensu.frame) + 'px';
						c.moveBy(0, 15);
					} else
						if (_hensu.muki == 'e') {
							nextbg.style.left = (640 - 16 * _hensu.frame) + 'px';
							bg.style.left = (0 - 16 * _hensu.frame) + 'px';
							c.moveBy(-15.2, 0);
						} else
							if (_hensu.muki == 's') {
								nextbg.style.top = (480 - 16 * _hensu.frame) + 'px';
								bg.style.top = (0 - 16 * _hensu.frame) + 'px';
								c.moveBy(0, -15);
							} else
								if (_hensu.muki == 'w') {
									nextbg.style.left = (-640 + 16 * _hensu.frame) + 'px';
									bg.style.left = (0 + 16 * _hensu.frame) + 'px';
									c.moveBy(15.2, 0);
								}

					if (_hensu.frameend <= _hensu.frame) {
						bg.src = nextbg.src;
						bg.style.top = '0px';
						nextbg.style.visible = 'none';


						if (_hensu.muki == 'n') {
							c.moveTo(c.x, 480 - 32);

						} else
							if (_hensu.muki == 'e') {
								c.moveTo(0, c.y);

							} else
								if (_hensu.muki == 's') {
									c.moveTo(c.x, 0);

								} else
									if (_hensu.muki == 'w') {
										c.moveTo(640 - 32, c.y);
									}



						for (var i = 0; i < _field.length; i++) {
							_field[i] = _nextField[i];
						}
						display();


						_mode = 'free';
					}
				}

			setTimeout(arguments.callee, _frameTiming);
		}

		function move_tate(hougaku) {
			var check_ascii_x = Math.floor((c.x + 0) / 16);
			var check_ascii_y = hougaku == 's' ? Math.floor((c.y + 32) / 32) : Math.floor(c.y / 32) - ((c.y % 32 == 0) ? 1 : 0);

			var check_c1 = get(check_ascii_x, check_ascii_y);
			var check_c2 = get(check_ascii_x + 1, check_ascii_y);
			var check_offet = c.x % 16 == 0 ? ' ' : get(check_ascii_x + 2, check_ascii_y);

			move_check(hougaku, check_c1, check_c2, check_offet);
		}

		function move_yoko(hougaku) {
			var check_ascii_x = hougaku == 'e' ? Math.floor((c.x + 32) / 16) : Math.floor(c.x / 16) - ((c.x % 16 == 0) ? 1 : 0);
			var check_ascii_y = Math.floor((c.y + 0) / 32);

			var check_c = get(check_ascii_x, check_ascii_y);
			var check_offet = c.y % 32 == 0 ? ' ' : get(check_ascii_x, check_ascii_y + 1);

			move_check(hougaku, check_c, ' ', check_offet);
		}

		function move_check(hougaku, c1, c2, c3) {
			if (c1 == ' ' && c2 == ' ' && c3 == ' ') {
				if (c.muki == hougaku) {
					putc(c.ascii_x, c.ascii_y, ' ');
					_koudouArray.push({ type: 'idou', value: _hougaku[hougaku] });
				} else {
					c.muki = hougaku;
				}
			}
		}

	});

})();
